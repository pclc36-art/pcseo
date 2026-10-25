import { 
  GbpClient, 
  GbpDossier, 
  GbpAuditReport, 
  GbpQuestionnaireData, 
  GbpDatabaseDump 
} from '../types/gbpTypes';

const DB_NAME = 'MasterPrompt_GBP_DB';
const DB_VERSION = 1;

const STORES = {
  CLIENTS: 'clients',
  DOSSIERS: 'dossiers',
  AUDITS: 'audits',
  DRAFTS: 'questionnaire_drafts',
  SETTINGS: 'db_settings',
} as const;

class GbpDatabaseService {
  private db: IDBDatabase | null = null;
  private isSupported: boolean = typeof window !== 'undefined' && 'indexedDB' in window;
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Database subscriber error:', err);
      }
    });
  }

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (!this.isSupported) {
      throw new Error('IndexedDB não suportado neste navegador.');
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Clients store
        if (!db.objectStoreNames.contains(STORES.CLIENTS)) {
          const clientStore = db.createObjectStore(STORES.CLIENTS, { keyPath: 'id' });
          clientStore.createIndex('name', 'name', { unique: false });
          clientStore.createIndex('businessName', 'businessName', { unique: false });
          clientStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Dossiers store
        if (!db.objectStoreNames.contains(STORES.DOSSIERS)) {
          const dossierStore = db.createObjectStore(STORES.DOSSIERS, { keyPath: 'id' });
          dossierStore.createIndex('clientId', 'clientId', { unique: false });
          dossierStore.createIndex('businessName', 'businessName', { unique: false });
          dossierStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Audits store
        if (!db.objectStoreNames.contains(STORES.AUDITS)) {
          const auditStore = db.createObjectStore(STORES.AUDITS, { keyPath: 'id' });
          auditStore.createIndex('clientId', 'clientId', { unique: false });
          auditStore.createIndex('businessName', 'businessName', { unique: false });
          auditStore.createIndex('overallScore', 'overallScore', { unique: false });
          auditStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Drafts store
        if (!db.objectStoreNames.contains(STORES.DRAFTS)) {
          db.createObjectStore(STORES.DRAFTS, { keyPath: 'id' });
        }

        // Settings / Meta store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        console.warn('Erro ao abrir IndexedDB. Usando modo de contingência LocalStorage.');
        reject(request.error);
      };
    });
  }

  private async init(): Promise<void> {
    try {
      await this.openDB();
      // Auto seed sample if completely fresh
      const clients = await this.getClients();
      if (clients.length === 0) {
        await this.seedDemoDataIfEmpty();
      }
    } catch (err) {
      console.warn('Falha na inicialização do IndexedDB:', err);
    }
  }

  // Generic helper for transaction execution
  private async perform<T>(
    storeName: string,
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest | void
  ): Promise<T> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      let request: IDBRequest | void;

      try {
        request = action(store);
      } catch (e) {
        reject(e);
        return;
      }

      transaction.oncomplete = () => {
        if (request && 'result' in request) {
          resolve(request.result);
        } else {
          resolve(undefined as unknown as T);
        }
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  // ================= CLIENTS =================
  public async getClients(): Promise<GbpClient[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORES.CLIENTS, 'readonly');
        const store = transaction.objectStore(STORES.CLIENTS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []) as GbpClient[];
          // Sort descending by updatedAt
          list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          resolve(list);
        };
        req.onerror = () => resolve(this.getFallback<GbpClient[]>('gbp_clients_fallback', []));
      });
    } catch {
      return this.getFallback<GbpClient[]>('gbp_clients_fallback', []);
    }
  }

  public async getClientById(id: string): Promise<GbpClient | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.CLIENTS, 'readonly');
        const store = tx.objectStore(STORES.CLIENTS);
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as GbpClient) || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      const clients = this.getFallback<GbpClient[]>('gbp_clients_fallback', []);
      return clients.find((c) => c.id === id) || null;
    }
  }

  public async saveClient(client: GbpClient): Promise<GbpClient> {
    client.updatedAt = new Date().toISOString();
    try {
      await this.perform(STORES.CLIENTS, 'readwrite', (store) => store.put(client));
    } catch {
      // Fallback
      const list = this.getFallback<GbpClient[]>('gbp_clients_fallback', []);
      const idx = list.findIndex((c) => c.id === client.id);
      if (idx >= 0) list[idx] = client;
      else list.unshift(client);
      this.setFallback('gbp_clients_fallback', list);
    }
    this.notify();
    return client;
  }

  public async deleteClient(id: string): Promise<void> {
    try {
      await this.perform(STORES.CLIENTS, 'readwrite', (store) => store.delete(id));
      // Delete associated dossiers and audits
      const dossiers = await this.getDossiers();
      for (const d of dossiers) {
        if (d.clientId === id) await this.deleteDossier(d.id);
      }
      const audits = await this.getAudits();
      for (const a of audits) {
        if (a.clientId === id) await this.deleteAudit(a.id);
      }
    } catch {
      const list = this.getFallback<GbpClient[]>('gbp_clients_fallback', []);
      this.setFallback('gbp_clients_fallback', list.filter((c) => c.id !== id));
    }
    this.notify();
  }

  // ================= DOSSIERS =================
  public async getDossiers(clientId?: string): Promise<GbpDossier[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.DOSSIERS, 'readonly');
        const store = tx.objectStore(STORES.DOSSIERS);
        const req = store.getAll();
        req.onsuccess = () => {
          let list = (req.result || []) as GbpDossier[];
          if (clientId) {
            list = list.filter((d) => d.clientId === clientId);
          }
          list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          resolve(list);
        };
        req.onerror = () => resolve(this.getFallback<GbpDossier[]>('gbp_dossiers_fallback', []));
      });
    } catch {
      let list = this.getFallback<GbpDossier[]>('gbp_dossiers_fallback', []);
      if (clientId) list = list.filter((d) => d.clientId === clientId);
      return list;
    }
  }

  public async getDossierById(id: string): Promise<GbpDossier | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.DOSSIERS, 'readonly');
        const store = tx.objectStore(STORES.DOSSIERS);
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as GbpDossier) || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      const list = this.getFallback<GbpDossier[]>('gbp_dossiers_fallback', []);
      return list.find((d) => d.id === id) || null;
    }
  }

  public async saveDossier(dossier: GbpDossier): Promise<GbpDossier> {
    dossier.updatedAt = new Date().toISOString();
    try {
      await this.perform(STORES.DOSSIERS, 'readwrite', (store) => store.put(dossier));
      // Update client dossierIds reference
      if (dossier.clientId) {
        const client = await this.getClientById(dossier.clientId);
        if (client) {
          if (!client.dossierIds.includes(dossier.id)) {
            client.dossierIds.push(dossier.id);
            await this.saveClient(client);
          }
        }
      }
    } catch {
      const list = this.getFallback<GbpDossier[]>('gbp_dossiers_fallback', []);
      const idx = list.findIndex((d) => d.id === dossier.id);
      if (idx >= 0) list[idx] = dossier;
      else list.unshift(dossier);
      this.setFallback('gbp_dossiers_fallback', list);
    }
    this.notify();
    return dossier;
  }

  public async deleteDossier(id: string): Promise<void> {
    try {
      await this.perform(STORES.DOSSIERS, 'readwrite', (store) => store.delete(id));
    } catch {
      const list = this.getFallback<GbpDossier[]>('gbp_dossiers_fallback', []);
      this.setFallback('gbp_dossiers_fallback', list.filter((d) => d.id !== id));
    }
    this.notify();
  }

  // ================= AUDITS =================
  public async getAudits(clientId?: string): Promise<GbpAuditReport[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.AUDITS, 'readonly');
        const store = tx.objectStore(STORES.AUDITS);
        const req = store.getAll();
        req.onsuccess = () => {
          let list = (req.result || []) as GbpAuditReport[];
          if (clientId) {
            list = list.filter((a) => a.clientId === clientId);
          }
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          resolve(list);
        };
        req.onerror = () => resolve(this.getFallback<GbpAuditReport[]>('gbp_audits_fallback', []));
      });
    } catch {
      let list = this.getFallback<GbpAuditReport[]>('gbp_audits_fallback', []);
      if (clientId) list = list.filter((a) => a.clientId === clientId);
      return list;
    }
  }

  public async getAuditById(id: string): Promise<GbpAuditReport | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.AUDITS, 'readonly');
        const store = tx.objectStore(STORES.AUDITS);
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as GbpAuditReport) || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      const list = this.getFallback<GbpAuditReport[]>('gbp_audits_fallback', []);
      return list.find((a) => a.id === id) || null;
    }
  }

  public async saveAudit(audit: GbpAuditReport): Promise<GbpAuditReport> {
    try {
      await this.perform(STORES.AUDITS, 'readwrite', (store) => store.put(audit));
      if (audit.clientId) {
        const client = await this.getClientById(audit.clientId);
        if (client) {
          if (!client.auditIds.includes(audit.id)) {
            client.auditIds.push(audit.id);
            await this.saveClient(client);
          }
        }
      }
    } catch {
      const list = this.getFallback<GbpAuditReport[]>('gbp_audits_fallback', []);
      const idx = list.findIndex((a) => a.id === audit.id);
      if (idx >= 0) list[idx] = audit;
      else list.unshift(audit);
      this.setFallback('gbp_audits_fallback', list);
    }
    this.notify();
    return audit;
  }

  public async deleteAudit(id: string): Promise<void> {
    try {
      await this.perform(STORES.AUDITS, 'readwrite', (store) => store.delete(id));
    } catch {
      const list = this.getFallback<GbpAuditReport[]>('gbp_audits_fallback', []);
      this.setFallback('gbp_audits_fallback', list.filter((a) => a.id !== id));
    }
    this.notify();
  }

  // ================= DRAFTS =================
  public async saveDraft(key: string, data: Partial<GbpQuestionnaireData>): Promise<void> {
    try {
      await this.perform(STORES.DRAFTS, 'readwrite', (store) =>
        store.put({ id: key, data, updatedAt: new Date().toISOString() })
      );
    } catch {
      localStorage.setItem(`gbp_draft_${key}`, JSON.stringify(data));
    }
  }

  public async getDraft(key: string): Promise<Partial<GbpQuestionnaireData> | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.DRAFTS, 'readonly');
        const store = tx.objectStore(STORES.DRAFTS);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      });
    } catch {
      const val = localStorage.getItem(`gbp_draft_${key}`);
      return val ? JSON.parse(val) : null;
    }
  }

  public async clearDraft(key: string): Promise<void> {
    try {
      await this.perform(STORES.DRAFTS, 'readwrite', (store) => store.delete(key));
    } catch {
      localStorage.removeItem(`gbp_draft_${key}`);
    }
  }

  // ================= DATABASE BACKUP & RESTORE =================
  public async exportFullDatabase(): Promise<GbpDatabaseDump> {
    const clients = await this.getClients();
    const dossiers = await this.getDossiers();
    const audits = await this.getAudits();

    let siteProjects: any[] = [];
    try {
      const p = localStorage.getItem('master_prompt_projects');
      if (p) siteProjects = JSON.parse(p);
    } catch {}

    return {
      version: '2.0.0-gbp-pro',
      exportedAt: new Date().toISOString(),
      clients,
      dossiers,
      audits,
      siteProjects,
    };
  }

  public async importFullDatabase(dump: GbpDatabaseDump): Promise<{ clients: number; dossiers: number; audits: number }> {
    if (!dump || !Array.isArray(dump.clients)) {
      throw new Error('Formato de arquivo JSON de backup inválido.');
    }

    let clientsCount = 0;
    let dossiersCount = 0;
    let auditsCount = 0;

    for (const client of dump.clients) {
      await this.saveClient(client);
      clientsCount++;
    }

    if (Array.isArray(dump.dossiers)) {
      for (const dossier of dump.dossiers) {
        await this.saveDossier(dossier);
        dossiersCount++;
      }
    }

    if (Array.isArray(dump.audits)) {
      for (const audit of dump.audits) {
        await this.saveAudit(audit);
        auditsCount++;
      }
    }

    if (Array.isArray(dump.siteProjects) && dump.siteProjects.length > 0) {
      try {
        localStorage.setItem('master_prompt_projects', JSON.stringify(dump.siteProjects));
      } catch {}
    }

    this.notify();
    return { clients: clientsCount, dossiers: dossiersCount, audits: auditsCount };
  }

  public async getDatabaseStats(): Promise<{
    isIndexedDBActive: boolean;
    clientsCount: number;
    dossiersCount: number;
    auditsCount: number;
    estimatedStorageKB: number;
  }> {
    const clients = await this.getClients();
    const dossiers = await this.getDossiers();
    const audits = await this.getAudits();

    // Approximate size in KB
    const dump = await this.exportFullDatabase();
    const approxBytes = new Blob([JSON.stringify(dump)]).size;

    return {
      isIndexedDBActive: Boolean(this.db),
      clientsCount: clients.length,
      dossiersCount: dossiers.length,
      auditsCount: audits.length,
      estimatedStorageKB: Math.round(approxBytes / 1024),
    };
  }

  // ================= SEED DEMO DATA =================
  private async seedDemoDataIfEmpty(): Promise<void> {
    const demoClient: GbpClient = {
      id: 'client_demo_odontosmile',
      name: 'Dra. Camila Vasconcelos',
      businessName: 'OdontoSmile Clínica Odontológica',
      email: 'contato@odontosmile.com.br',
      phone: '(11) 98765-4321',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dossierIds: ['dossier_demo_odontosmile'],
      auditIds: ['audit_demo_odontosmile'],
    };

    const demoDossier: GbpDossier = {
      id: 'dossier_demo_odontosmile',
      clientId: demoClient.id,
      clientName: demoClient.name,
      businessName: demoClient.businessName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'completed',
      version: 1,
      generatedBy: 'heuristic',
      questionnaire: {
        businessName: 'OdontoSmile Clínica Odontológica',
        primaryNiche: 'Clínica Odontológica e Implantes',
        fullAddress: 'Av. Ibirapuera, 2034, Conjunto 42, Moema',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '04028-001',
        serviceAreas: ['Moema', 'Vila Nova Conceição', 'Campo Belo', 'Itaim Bibi', 'Vila Mariana'],
        phone: '(11) 3456-7890',
        whatsapp: '(11) 98765-4321',
        website: 'https://odontosmile.com.br',
        operatingHours: 'Segunda a Sexta: 08:00 às 19:00 | Sábado: 08:00 às 13:00',
        serviceFormat: 'physical',
        items: [
          {
            id: 'item_1',
            name: 'Implantes Dentários Guiados',
            category: 'Implantodontia',
            isPriority: true,
            priceEstimate: 'Sob consulta clínica personalizada',
            description: 'Recuperação estética e funcional com cirurgia guiada por computador, sem dor e recuperação rápida.',
          },
          {
            id: 'item_2',
            name: 'Alinhadores Invisíveis (Invisalign)',
            category: 'Ortodontia',
            isPriority: true,
            priceEstimate: 'Planos a partir de R$ 350/mês',
            description: 'Tratamento ortodôntico digital sem fios metálicos, discreto e confortável para adultos e jovens.',
          },
          {
            id: 'item_3',
            name: 'Clareamento Dental a Laser e Caseiro',
            category: 'Estética Dental',
            isPriority: false,
            priceEstimate: 'A partir de R$ 800',
            description: 'Protocolo de clareamento supervisionado para dentes naturalmente mais brancos e luminosos.',
          },
        ],
        priorityItemToPromote: 'Implantes Dentários Guiados e Alinhadores Invisíveis',
        differentials: [
          'Scanner intraoral 3D sem moldagens desconfortáveis',
          'Equipe com especialistas mestres pela USP',
          'Estacionamento com manobrista no local',
          'Atendimento pontual com agendamento dedicado',
        ],
        yearsInMarket: '12 anos',
        certificationsAndLicenses: ['CRO-SP 102938', 'Certificação Invisalign Diamond Doctor', 'Membro Sociedade Brasileira de Odontologia Estética'],
        targetAudience: 'Profissionais e famílias da zona sul de SP que valorizam atendimento odontológico humanizado e tecnologia de ponta.',
        userSuggestedKeywords: ['dentista moema', 'implante dentario moema', 'invisalign sp zona sul', 'clareamento dental moema'],
        primaryObjective: 'appointments',
        socialMediaLinks: ['https://instagram.com/odontosmile.moema', 'https://facebook.com/odontosmile'],
        knownCompetitors: ['Clínica Odonto Moema', 'Instituto Sorriso SP'],
        availableMaterials: {
          hasLogo: true,
          hasFacadePhoto: true,
          hasTeamPhotos: true,
          hasEnvironmentPhotos: true,
          hasProductPhotos: true,
          hasWebsite: true,
        },
        hasExistingProfile: true,
        existingProfileUrl: 'https://maps.google.com/?cid=123456789',
        additionalNotes: 'Clínica localizada a 200m da estação Moema do metrô (Linha 5-Lilás).',
      },
      categories: {
        primaryCategory: 'Clínica odontológica',
        primaryJustification: 'Alinha-se diretamente à atividade principal reconhecida na taxonomia oficial do Google, maximizando relevância nas buscas locais por dentistas.',
        secondaryCategories: ['Ortodontista', 'Dentista', 'Cirurgião dentista', 'Clínica de clareamento dental'],
        categoriesToAvoid: ['Laboratório odontológico', 'Centro de saúde pública'],
        relevanceNotes: 'Evitar categorias que diluam o foco cirúrgico e ortodôntico. Manter no máximo 4 secundárias estritamente conectadas aos serviços oferecidos.',
      },
      addressStrategy: {
        serviceModel: 'physical',
        storefrontVisible: true,
        serviceRadiusKm: 15,
        coveredAreas: ['Moema', 'Vila Nova Conceição', 'Campo Belo', 'Itaim Bibi', 'Vila Mariana'],
        complianceNotes: 'Apresenta placa externa e consultório físico em prédio comercial. Elegível para endereço visível com verificação por vídeo ou código.',
        verificationAdvice: 'Gravar vídeo contínuo mostrando a rua (placa com nome da avenida), fachada do edifício comercial, elevador/andar e placa interna na recepção com os instrumentos.',
      },
      attributes: {
        accessibility: ['Entrada acessível para cadeira de rodas', 'Elevador acessível', 'Banheiro adaptado'],
        paymentMethods: ['Cartões de crédito', 'Cartões de débito', 'Pix', 'Pagamento por aproximação (NFC)'],
        amenities: ['Wi-Fi gratuito', 'Ar-condicionado', 'Banheiro unissex'],
        planning: ['Agendamento prévio recomendado'],
        highlights: ['Empresa liderada por mulher', 'Equipe multilíngue (Português, Inglês)'],
      },
      seo: {
        primaryKeyword: 'dentista em moema',
        secondaryKeywords: ['implante dentário moema sp', 'invisalign moema são paulo', 'clareamento dental moema', 'clínica odontológica sp'],
        geoModifiers: ['Moema', 'Zona Sul SP', 'próximo ao metrô Moema', 'São Paulo capital'],
        napStandard: {
          name: 'OdontoSmile Clínica Odontológica',
          address: 'Av. Ibirapuera, 2034, Conjunto 42 - Moema, São Paulo - SP, 04028-001',
          phone: '(11) 3456-7890',
        },
        searchIntents: [
          { intent: 'Urgência / Emergência', keywords: ['dentista em moema hoje', 'dor de dente moema'] },
          { intent: 'Tratamento Planejado', keywords: ['implante dentario sem dor moema', 'invisalign valor moema'] },
          { intent: 'Estética', keywords: ['clareamento a laser moema sp', 'harmonização orofacial moema'] },
        ],
      },
      description: {
        fullDescription: 'Clínica odontológica de referência em Moema, São Paulo, especializada em Implantes Dentários Guiados por computador e Alinhadores Invisíveis (Invisalign). Com mais de 12 anos de atuação e equipe mestre pela USP, a OdontoSmile oferece scanner 3D sem moldagens desconfortáveis, clareamento dental a laser e odontologia estética de alto padrão. Atendimento humanizado, pontual e estruturado com conforto em Moema, a poucos metros do metrô. Agende sua avaliação personalizada pelo WhatsApp ou telefone.',
        first250CharsHook: 'Clínica odontológica de referência em Moema, São Paulo, especializada em Implantes Dentários Guiados por computador e Alinhadores Invisíveis (Invisalign). Com mais de 12 anos de atuação e equipe mestre pela USP, oferecemos tecnologia e conforto.',
        charCount: 498,
        complianceChecks: {
          noLinks: true,
          noProhibitedPromotions: true,
          noKeywordStuffing: true,
          noAllCaps: true,
        },
      },
      catalog: [
        {
          id: 'item_1',
          name: 'Implantes Dentários Guiados',
          category: 'Implantodontia',
          isPriority: true,
          priceEstimate: 'Sob consulta clínica',
          description: 'Cirurgia guiada por computador com microincisão, pós-operatório previsível e conforto máximo.',
        },
        {
          id: 'item_2',
          name: 'Alinhadores Invisíveis Invisalign',
          category: 'Ortodontia Digital',
          isPriority: true,
          priceEstimate: 'Sob consulta personalizada',
          description: 'Alinhamento dental digital com placas transparentes removíveis para máximo conforto e estética.',
        },
      ],
      photoChecklist: [
        {
          id: 'p1',
          category: 'fachada',
          title: 'Fachada do Edifício Comercial com Letreiro',
          recommendedSpec: '1200x900px, JPG sem compressão, iluminação diurna clara',
          seoFileName: 'clinica-odontosmile-fachada-av-ibirapuera-moema.jpg',
          isCrucialForVerification: true,
          description: 'Mostra o edifício e o acesso da Av. Ibirapuera para orientar os pacientes e comprovar veracidade.',
        },
        {
          id: 'p2',
          category: 'interior',
          title: 'Recepção e Sala de Espera Confortável',
          recommendedSpec: '1200x900px, JPG horizontal',
          seoFileName: 'recepcao-consultorio-odontologico-moema.jpg',
          isCrucialForVerification: false,
          description: 'Ambiente aconchegante, clean, com água, café e poltronas ergonômicas.',
        },
        {
          id: 'p3',
          category: 'trabalho_em_andamento',
          title: 'Scanner Intraoral 3D em Operação',
          recommendedSpec: '1200x900px, foco nítido na tecnologia',
          seoFileName: 'scanner-intraoral-3d-tecnologia-odontosmile-moema.jpg',
          isCrucialForVerification: false,
          description: 'Destaca o equipamento tecnológico moderno dispensando massas de moldagem.',
        },
      ],
      reviewStrategy: {
        reviewShortlinkTip: 'Gere o link curto no painel do Google Meu Negócio (g.page/r/...) e envie pelo WhatsApp 2 horas após a consulta bem-sucedida.',
        qrCodeUsageTip: 'Imprima plaquinha acrílica com QR Code do Google Avaliações no balcão da recepção com a frase: "Sua opinião ajuda outros pacientes a encontrar cuidado odontológico seguro".',
        responseTemplates: {
          fiveStar: 'Olá, {Nome}! Muito obrigado pelas gentis palavras e pela confiança em nossa equipe na OdontoSmile Moema. Ficamos extremamente felizes em acompanhar seu sorriso. Conte sempre conosco!',
          fourStarPositiveWithFeedback: 'Olá, {Nome}! Agradecemos imensamente por sua avaliação e pelo feedback sobre nosso atendimento. Nosso compromisso diário é a excelência. Até a sua próxima revisão preventiva!',
          threeStarNeutral: 'Olá, {Nome}. Obrigado pelo seu retorno. Queremos sempre garantir a melhor experiência possível em nossa clínica em Moema. Entre em contato diretamente pelo WhatsApp (11) 98765-4321 para conversarmos e aprimorarmos nosso atendimento.',
          oneOrTwoStarCritical: 'Olá, {Nome}. Sentimos muito que sua percepção não tenha correspondido ao padrão de acolhimento e qualidade da OdontoSmile. Prezamos pela saúde de cada paciente. Por favor, fale diretamente com nossa coordenação pelo telefone (11) 3456-7890 para compreendermos e resolvermos prontamente.',
          fakeOrUnfairSuspected: 'Olá. Não identificamos seu nome em nosso registro de pacientes cadastrados. Somos uma clínica com 12 anos de compromisso em Moema. Caso tenha havido qualquer engano, pedimos que entre em contato no (11) 3456-7890 para esclarecermos.',
        },
        ethicalGuidelines: [
          'Nunca compre avaliações nem ofereça brindes/descontos em troca de 5 estrelas (proibido pelas diretrizes do Google).',
          'Solicite avaliações apenas de pacientes reais em momentos de alta satisfação pós-tratamento.',
          'Responda a 100% das avaliações em menos de 24 horas úteis com tom acolhedor e profissional.',
        ],
      },
      editorialCalendar: [
        {
          day: 1,
          type: 'update',
          topic: 'Apresentação da Clínica & Tecnologia 3D',
          headline: 'Conheça a odontologia digital sem moldagens em Moema',
          body: 'Você ainda tem receio de ir ao dentista por causa das massas desconfortáveis de moldagem? Na OdontoSmile utilizamos scanner 3D de alta precisão. Agende sua consulta no link abaixo.',
          ctaButton: 'Saiba mais',
          photoGuidance: 'Foto do scanner 3D em alta resolução na clínica.',
        },
        {
          day: 7,
          type: 'offer',
          topic: 'Diferenciais do Invisalign',
          headline: 'Alinhe seus dentes com discrição e conforto',
          body: 'Descubra como os alinhadores transparentes corrigem sua mordida e estética sem fios metálicos. Atendimento personalizado em Moema com dentistas certificados.',
          ctaButton: 'Ligar agora',
          photoGuidance: 'Foto estética dos alinhadores limpos em estojo.',
        },
        {
          day: 15,
          type: 'photo_spotlight',
          topic: 'Bastidores de Biossegurança e Acolhimento',
          headline: 'Ambiente higienizado e acolhedor esperando por você',
          body: 'Nosso espaço foi planejado para oferecer tranquilidade e pontualidade, pertinho da estação Moema. Venha tomar um café conosco.',
          ctaButton: 'Reservar',
          photoGuidance: 'Foto da recepção iluminada e aconchegante.',
        },
      ],
      faq: [
        {
          id: 'faq_1',
          question: 'Onde a clínica OdontoSmile está localizada em Moema?',
          answer: 'Estamos na Av. Ibirapuera, 2034, conjunto 42, a cerca de 200 metros da Estação Moema do Metrô (Linha 5-Lilás), com fácil acesso e estacionamento com manobrista no edifício.',
          strategicGoal: 'Esclarecer localização exata e conveniência de transporte.',
        },
        {
          id: 'faq_2',
          question: 'Como funciona a primeira avaliação odontológica?',
          answer: 'Nossa avaliação inclui diagnóstico visual detalhado, escaneamento digital quando indicado e apresentação clara do plano de tratamento sem compromisso.',
          strategicGoal: 'Reduzir ansiedade e atrito para primeiro agendamento.',
        },
        {
          id: 'faq_3',
          question: 'Vocês atendem por convênio ou particular?',
          answer: 'Trabalhamos com consultas particulares de alto padrão e emitimos toda a documentação comprobatória com laudo para reembolso junto ao seu convênio.',
          strategicGoal: 'Explicar modelo financeiro e política de reembolso.',
        },
      ],
      complianceChecks: [
        {
          item: 'Nome Oficial sem Keyword Stuffing',
          status: 'safe',
          details: 'O nome "OdontoSmile Clínica Odontológica" reflete a marca real sem adicionar slogans proibidos ("Dentista Barato Moema").',
        },
        {
          item: 'Endereço Comercial Legítimo',
          status: 'safe',
          details: 'Localização em edifício comercial autêntico, sem uso de caixa postal ou coworking não operacional.',
        },
        {
          item: 'Telefone e WhatsApp Locais',
          status: 'safe',
          details: 'DDD 11 com número direto e WhatsApp ativo.',
        },
      ],
      maintenancePlan90Days: {
        month1: [
          'Completar verificação oficial do perfil via código ou vídeo.',
          'Subir as primeiras 15 fotos de alta resolução nos horários ideais.',
          'Cadastrar os 5 principais serviços no Catálogo detalhado.',
          'Publicar o primeiro post com novidades e foto da equipe.',
        ],
        month2: [
          'Implantar rotina diária de solicitação de avaliações via WhatsApp pós-atendimento.',
          'Manter 1 publicação semanal na aba Atualizações com CTA direto.',
          'Responder a 100% dos comentários e avaliações recebidas.',
          'Monitorar termos de busca locais no Painel de Insights do Google.',
        ],
        month3: [
          'Avaliar crescimento nas solicitações de rota no Google Maps e ligações.',
          'Adicionar novas fotos sazonais e de novos procedimentos realizados.',
          'Publicar posts com ofertas e eventos sazonais.',
          'Realizar auditoria comparativa trimestral para acompanhar concorrentes.',
        ],
      },
    };

    const demoAudit: GbpAuditReport = {
      id: 'audit_demo_odontosmile',
      clientId: demoClient.id,
      clientName: demoClient.name,
      businessName: demoClient.businessName,
      profileUrl: 'https://maps.google.com/?cid=123456789',
      createdAt: new Date().toISOString(),
      overallScore: 84,
      scoreLevel: 'bom',
      summary: 'Perfil com excelente base local e autoridade em Moema, mas com potencial imediato de elevação de score através de atualização de fotos recentes e preenchimento de atributos de acessibilidade.',
      pillars: {
        guidelinesAndName: {
          name: 'Diretrizes & Nome do Perfil',
          score: 20,
          maxScore: 20,
          weightPercent: 20,
          status: 'excellent',
          diagnostics: ['Nome limpo e em total conformidade com o CNPJ e fachada.', 'Sem acréscimo indevido de palavras-chave no título.'],
        },
        categoriesTaxonomy: {
          name: 'Categorias & Taxonomia',
          score: 15,
          maxScore: 15,
          weightPercent: 15,
          status: 'excellent',
          diagnostics: ['Categoria primária "Clínica odontológica" assertiva.', 'Secundárias relevantes cadastradas.'],
        },
        napAndLocation: {
          name: 'NAP & Cobertura Geográfica',
          score: 14,
          maxScore: 15,
          weightPercent: 15,
          status: 'good',
          diagnostics: ['Endereço completo com número de sala e CEP.', 'Área de atendimento regional bem configurada.'],
        },
        descriptionOptimization: {
          name: 'Descrição & SEO Local',
          score: 10,
          maxScore: 10,
          weightPercent: 10,
          status: 'excellent',
          diagnostics: ['Descrição com gancho nos primeiros 250 caracteres.', 'Sem links externos proibidos.'],
        },
        reviewsAndReputation: {
          name: 'Avaliações & Reputação',
          score: 12,
          maxScore: 15,
          weightPercent: 15,
          status: 'good',
          diagnostics: ['Nota 4.9 com 48 avaliações.', 'Taxa de resposta em 85% (ideal é 100%).'],
        },
        visualPresence: {
          name: 'Presença Visual & Fotos',
          score: 8,
          maxScore: 15,
          weightPercent: 15,
          status: 'warning',
          diagnostics: ['Apenas 6 fotos cadastradas nos últimos 6 meses.', 'Faltam fotos da equipe e ambiente interno em alta resolução.'],
        },
        engagementAndFaq: {
          name: 'Engajamento, Posts & FAQ',
          score: 5,
          maxScore: 10,
          weightPercent: 10,
          status: 'warning',
          diagnostics: ['Último post publicado há mais de 45 dias.', 'Nenhuma pergunta cadastrada na aba de Perguntas e Respostas da comunidade.'],
        },
      },
      recommendations: [
        {
          id: 'rec_1',
          severity: 'high',
          title: 'Retomar Postagens Semanais no Perfil',
          issueFound: 'A última postagem no perfil tem mais de 45 dias.',
          riskIfIgnored: 'Perda de relevância nos sinais de atividade recente avaliados pelo algoritmo do Google Maps.',
          actionRequired: 'Publicar imediatamente 1 atualização com foto do scanner 3D e botão "Ligar agora".',
          suggestedContent: 'Post sugerido: "Tecnologia 3D e cuidado humanizado para seu sorriso em Moema. Agende sua consulta!"',
        },
        {
          id: 'rec_2',
          severity: 'medium',
          title: 'Adicionar Lote de 10 Novas Fotos Autênticas',
          issueFound: 'Fotos atuais têm mais de 6 meses de antiguidade.',
          riskIfIgnored: 'Menor taxa de cliques de novos pacientes em busca de clínicas modernas.',
          actionRequired: 'Fotografar a recepção, consultório 1 e equipe em atendimento e subir com nomes otimizados para SEO.',
        },
        {
          id: 'rec_3',
          severity: 'low',
          title: 'Preencher Perguntas Frequentes (Q&A)',
          issueFound: 'Seção de perguntas da comunidade vazia.',
          riskIfIgnored: 'Pacientes em dúvida sobre estacionamento e convênios podem desistir da visita.',
          actionRequired: 'Publicar as 3 principais dúvidas frequentes com respostas claras e objetivas.',
        },
      ],
      whatToModify: [
        {
          title: 'Aumentar Frequência de Postagens Semanais',
          currentSituation: 'Último post publicado há mais de 45 dias.',
          risk: 'Perda gradual de posicionamento nos sinais de atividade recente (Freshness) do Google Maps.',
          howToFix: 'Agendar 1 postagem semanal na aba Atualizações com foto de caso clínico e botão Ligar Agora.',
          priority: 'alta',
        },
        {
          title: 'Elevar Taxa de Resposta a Comentários',
          currentSituation: 'Taxa atual de resposta estimada em 85%.',
          risk: 'Pacientes em dúvida interpretam falta de resposta como descaso.',
          howToFix: 'Responder a 100% das avaliações em até 24 horas úteis com mensagens personalizadas.',
          priority: 'média',
        },
      ],
      whatToInclude: [
        {
          title: 'Cadastrar 3 Perguntas e Respostas Comunitárias (FAQ)',
          benefit: 'Resolve dúvidas sobre convênios e localização antes mesmo da ligação.',
          implementationDetails: 'Inserir perguntas sobre cobertura de reembolso de planos e estacionamento com manobrista.',
          priority: 'alta',
        },
        {
          title: 'Subir 15 Fotos Otimizadas para SEO',
          benefit: 'Aumenta em até 35% as solicitações de rota no Google Maps.',
          implementationDetails: 'Fotos de alta resolução com nomes de arquivo otimizados (ex: clinica-odontosmile-fachada-moema.jpg).',
          priority: 'alta',
        },
      ],
      correctiveCopy: {
        recommendedBusinessName: 'OdontoSmile Clínica Odontológica',
        recommendedDescription: 'Clínica odontológica em Moema com implantes dentários guiados e alinhadores invisíveis Invisalign. Atendimento humanizado e tecnologia 3D.',
        recommendedPrimaryCategory: 'Clínica odontológica',
        recommendedSecondaryCategories: ['Ortodontista', 'Dentista', 'Cirurgião dentista'],
        reviewResponseTemplate: 'Agradecemos de coração pela sua confiança na OdontoSmile Moema! Nosso compromisso é cuidar do seu sorriso.',
        samplePostToPublish: 'Você sabia que o escaneamento 3D dispensa massas desconfortáveis? Conheça nossa odontologia digital em Moema.',
        recommendedFaqs: [
          {
            question: 'Onde a clínica OdontoSmile está localizada em Moema?',
            answer: 'Estamos na Av. Ibirapuera, 2034, conj. 42, a 200m da Estação Moema do Metrô, com manobrista no local.',
          },
        ],
        recommendedPosts: [
          {
            title: 'Odontologia Digital sem Moldagens',
            body: 'Conheça o escaneamento 3D em Moema. Agende sua avaliação!',
            cta: 'Ligar agora',
          },
        ],
        attributesToActivate: ['Entrada acessível', 'Banheiro adaptado', 'Aceita cartões', 'Aceita Pix'],
        photoGuidelines: ['Fachada com letreiro diurno', 'Recepção aconchegante', 'Equipe com jaleco'],
      },
    };

    try {
      await this.saveClient(demoClient);
      await this.saveDossier(demoDossier);
      await this.saveAudit(demoAudit);
    } catch {
      // ignore seed errors
    }
  }

  // LocalStorage Fallbacks
  private getFallback<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setFallback<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage cheio ou inacessível:', e);
    }
  }
}

export const gbpDatabase = new GbpDatabaseService();

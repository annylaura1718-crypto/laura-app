import { ApiRollResponse, BlazeRoll, BlazeColor } from '../types';

const BLAZE_API_URL = 'https://blaze.bet.br/api/singleplayer-originals/originals/roulette_games/recent/1';

const mapColor = (colorId: number): BlazeColor => {
  if (colorId === 1) return 'red';
  if (colorId === 2) return 'black';
  return 'white';
};

// Lista de proxies para redundância
const PROXIES = [
  // Opção 1: AllOrigins (Geralmente estável)
  {
    getUrl: (target: string) => `https://api.allorigins.win/get?disableCache=true&url=${encodeURIComponent(target)}`,
    parse: (data: any) => {
      if (!data.contents) throw new Error('No contents in proxy response');
      return JSON.parse(data.contents);
    }
  },
  // Opção 2: CodeTabs (Backup)
  {
    getUrl: (target: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`,
    parse: (data: any) => data // Retorna direto
  }
];

export const fetchBlazeHistory = async (): Promise<BlazeRoll[]> => {
  // Tenta cada proxy na ordem
  for (const proxy of PROXIES) {
    try {
      // Adiciona timestamp apenas para garantir que o navegador não cacheie a requisição ao proxy
      const timestamp = new Date().getTime();
      const url = `${proxy.getUrl(BLAZE_API_URL)}&_t=${timestamp}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        continue; // Tenta o próximo proxy se falhar
      }

      const rawData = await response.json();
      const parsedData = proxy.parse(rawData) as ApiRollResponse[];

      if (!Array.isArray(parsedData)) {
        continue;
      }

      return parsedData.map((item) => ({
        id: item.id,
        color: mapColor(item.color),
        roll: item.roll,
        created_at: item.created_at
      }));

    } catch (error) {
      console.warn(`Proxy attempt failed:`, error);
      // Continua para o próximo proxy
    }
  }

  console.error("All proxies failed to fetch Blaze data");
  return []; // Retorna vazio se tudo falhar
};
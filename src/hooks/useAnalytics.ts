import { track } from '@vercel/analytics';

export const useAnalytics = () => {
  const trackEvent = (name: string, properties?: Record<string, string | number | boolean>) => {
    if (typeof window !== 'undefined') {
      track(name, properties);
    }
  };

  return {
    // Eventos de autenticação
    trackLogin: () => trackEvent('login'),
    trackLogout: () => trackEvent('logout'),
    
    // Eventos de torneios
    trackTournamentCreate: () => trackEvent('tournament_create'),
    trackTournamentView: (tournamentId: string) => trackEvent('tournament_view', { tournamentId }),
    trackTournamentEdit: (tournamentId: string) => trackEvent('tournament_edit', { tournamentId }),
    trackParticipantAdd: (tournamentId: string) => trackEvent('participant_add', { tournamentId }),
    
    // Eventos de jogadores
    trackPlayerCreate: () => trackEvent('player_create'),
    trackPlayerView: (playerId: string) => trackEvent('player_view', { playerId }),
    trackPlayerEdit: (playerId: string) => trackEvent('player_edit', { playerId }),
    
    // Eventos de ranking
    trackRankingView: (month?: string, year?: string) => {
      const properties: Record<string, string> = {};
      if (month) properties.month = month;
      if (year) properties.year = year;
      trackEvent('ranking_view', properties);
    },
    trackRankingFilter: (period: string) => trackEvent('ranking_filter', { period }),
    
    // Eventos de navegação
    trackPageView: (page: string) => trackEvent('page_view', { page }),
    trackFeatureUsage: (feature: string) => trackEvent('feature_usage', { feature }),
  };
};

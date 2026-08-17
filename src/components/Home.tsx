import React, { useEffect, useState } from 'react';
import {
  FileText,
  Scissors,
  FileArchive,
  ScanText,
  Headphones,
  Star,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../lib/i18n';
import AdBanner from '../components/AdBanner';
import { Header } from '../components/Header';
import Footer from '../components/Footer';

interface Avaliacao {
  id: string | number;
  nota?: number;
  rating?: number;
  estrelas?: number;
  comentario?: string;
  comment?: string;
  criado_em?: string;
  created_at?: string;
  aprovado?: boolean;
}

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        const { data, error } = await supabase
          .from('avaliacoes')
          .select('*')
          .eq('aprovado', true)
          .order('criado_em', { ascending: false });

        if (error) console.error('Erro no Supabase:', error);
        else if (data) setAvaliacoes(data);
      } catch (err) {
        console.error('Falha na conexão com Supabase:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvaliacoes();
  }, []);

  const totalVotes = avaliacoes.length;
  const getRating = (a: Avaliacao) => Number(a.estrelas ?? a.nota ?? a.rating ?? 0);
  const getComment = (a: Avaliacao) => a.comentario ?? a.comment ?? '';
  const getDate = (a: Avaliacao) => a.criado_em ?? a.created_at ?? '';

  const totalSum = avaliacoes.reduce((acc, curr) => acc + getRating(curr), 0);
  const averageRating = totalVotes > 0 ? (totalSum / totalVotes).toFixed(1) : '0.0';

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = avaliacoes.filter((a) => Math.round(getRating(a)) === star).length;
    const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
    return { star, count, percentage };
  });

  const commentsWithText = avaliacoes.filter((a) => getComment(a).trim().length > 0);

  const tools = [
    {
      id: 'unir',
      title: t('tools.unirTitle', 'Unir PDF'),
      description: t('tools.unirDesc', 'Combine múltiplos arquivos PDF em um único documento organizado.'),
      icon: FileText,
      href: '/unir.html',
      badge: 'Popular'
    },
    {
      id: 'ocr',
      title: t('tools.ocrTitle', 'OCR (Texto de PDF)'),
      description: t('tools.ocrDesc', 'Reconheça e extraia textos legíveis de PDFs ou imagens escaneadas.'),
      icon: ScanText,
      href: '/ocr.html'
    },
    {
      id: 'transcricao',
      title: t('tools.transcriptionTitle', 'Transcrição de Áudio'),
      description: t('tools.transcriptionDesc', 'Converta suas gravações de voz e áudios em texto rapidamente.'),
      icon: Headphones,
      href: '/transcricao.html'
    },
    {
      id: 'dividir',
      title: t('tools.splitTitle', 'Dividir PDF'),
      description: t('tools.splitDesc', 'Separe páginas ou extraia trechos específicos do seu PDF.'),
      icon: Scissors,
      href: '/dividir.html'
    },
    {
      id: 'comprimir',
      title: t('tools.compressTitle', 'Comprimir PDF'),
      description: t('tools.compressDesc', 'Reduza o tamanho do arquivo preservando a máxima qualidade.'),
      icon: FileArchive,
      href: '/comprimir.html'
    }
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try { return new Date(dateString).toLocaleDateString('pt-BR'); } catch { return dateString; }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between font-sans">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full space-y-12">
        <Header />

        <div className="w-full flex justify-center my-6">
          <AdBanner page="home" position="top" />
        </div>

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {t('home.availableTools', 'Ferramentas Disponíveis')}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('home.secureLocalProcessing', 'Processamento local seguro')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <a
                  key={tool.id}
                  href={tool.href}
                  className="group relative text-left bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:border-teal-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  {tool.badge && (
                    <span className="absolute top-4 right-4 bg-teal-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">
                      {tool.badge}
                    </span>
                  )}
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-6 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{t('home.accessTool', 'Acessar ferramenta')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                {t('home.userReviews', 'Avaliações dos Usuários')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('home.userReviewsSub', 'Feedback transparente enviado diretamente pelos nossos usuários.')}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{averageRating}</span>
              <div>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                  ))}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {totalVotes} {totalVotes === 1 ? 'voto' : 'votos no total'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-w-xl">
            {distribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3 text-xs sm:text-sm">
                <span className="w-12 font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  {star} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </span>
                <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-12 text-right text-slate-500 dark:text-slate-400 font-mono">{count}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              {t('home.recentComments', 'Comentários Recentes (Anônimos)')}
            </h3>

            {loading ? (
              <div className="text-center py-6 text-sm text-slate-400 animate-pulse">Carregando avaliações...</div>
            ) : commentsWithText.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400 italic">Nenhum comentário em texto registrado ainda.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commentsWithText.slice(0, 6).map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/50 flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < getRating(item) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'} />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">"{getComment(item)}"</p>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>{t('home.anonymousUser', 'Usuário Anônimo')}</span>
                      <span>{formatDate(getDate(item))}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="w-full flex justify-center my-6">
          <AdBanner page="home" position="bottom" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
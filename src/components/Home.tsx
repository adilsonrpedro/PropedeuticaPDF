import React, { useEffect, useState } from 'react';
import {
  FileText,
  Scissors,
  FileArchive,
  ScanText,
  Headphones,
  Star,
  MessageSquare,
  Instagram,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Avaliacao {
  id: string | number;
  nota?: number;
  rating?: number;
  comentario?: string;
  comment?: string;
  created_at: string;
}

interface HomeProps {
  t?: any;
}

export const Home: React.FC<HomeProps> = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        const { data, error } = await supabase
          .from('avaliacoes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar avaliações do Supabase:', error);
        } else if (data) {
          setAvaliacoes(data);
        }
      } catch (err) {
        console.error('Falha de conexão com o Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvaliacoes();
  }, []);

  // Cálculos das estatísticas de avaliação
  const totalVotes = avaliacoes.length;
  const getRating = (a: Avaliacao) => a.nota ?? a.rating ?? 5;
  const getComment = (a: Avaliacao) => a.comentario ?? a.comment ?? '';

  const totalSum = avaliacoes.reduce((acc, curr) => acc + getRating(curr), 0);
  const averageRating = totalVotes > 0 ? (totalSum / totalVotes).toFixed(1) : '5.0';

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = avaliacoes.filter((a) => Math.round(getRating(a)) === star).length;
    const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
    return { star, count, percentage };
  });

  const commentsWithText = avaliacoes.filter((a) => getComment(a).trim().length > 0);

  const tools = [
    {
      id: 'unir',
      title: 'Unir PDF',
      description: 'Combine múltiplos arquivos PDF em um único documento organizado.',
      icon: FileText,
      href: '/unir',
      badge: 'Popular'
    },
    {
      id: 'ocr',
      title: 'OCR (Texto de PDF)',
      description: 'Reconheça e extraia textos legíveis de PDFs ou imagens escaneadas.',
      icon: ScanText,
      href: '/ocr'
    },
    {
      id: 'transcricao',
      title: 'Transcrição de Áudio',
      description: 'Converta suas gravações de voz e áudios em texto rapidamente.',
      icon: Headphones,
      href: '/transcricao'
    },
    {
      id: 'dividir',
      title: 'Dividir PDF',
      description: 'Separe páginas ou extraia trechos específicos do seu PDF.',
      icon: Scissors,
      href: '/dividir'
    },
    {
      id: 'comprimir',
      title: 'Comprimir PDF',
      description: 'Reduza o tamanho do arquivo preservando a máxima qualidade.',
      icon: FileArchive,
      href: '/comprimir'
    }
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between font-sans">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-16">
        
        {/* Banner Hero */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Suíte Completa de Ferramentas PDF & IA
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
            <img src="/logo.svg" alt="Logo PropedeuticaPDF" className="h-8 w-auto object-contain" />
            <span>Propedeutica<span className="text-teal-600 dark:text-teal-400">PDF</span></span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Processamento rápido, seguro e no seu próprio navegador. Escolha uma das ferramentas abaixo para começar.
          </p>
        </section>

        {/* Painel de Ferramentas Estático */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Ferramentas Disponíveis
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Processamento local seguro
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <a
                  key={tool.id}
                  href={tool.href}
                  className="group relative text-left bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:border-teal-500/50 dark:hover:border-teal-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  {tool.badge && (
                    <span className="absolute top-4 right-4 bg-teal-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">
                      {tool.badge}
                    </span>
                  )}
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex items-center gap-1.5">
                      {tool.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-6 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Acessar ferramenta</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Quadro de Avaliações Dinâmico */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                Avaliações dos Usuários
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Feedback transparente enviado diretamente pelos nossos usuários.
              </p>
            </div>
            
            {/* Média Geral */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {averageRating}
              </span>
              <div>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(Number(averageRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {totalVotes} {totalVotes === 1 ? 'voto' : 'votos no total'}
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico Simples de Barras */}
          <div className="space-y-2 max-w-xl">
            {distribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3 text-xs sm:text-sm">
                <span className="w-12 font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  {star} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </span>
                <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right text-slate-500 dark:text-slate-400 font-mono">
                  {count}
                </span>
              </div>
            ))}
          </div>

          {/* Lista de Comentários Anônimos */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Comentários Recentes (Anônimos)
            </h3>

            {loading ? (
              <div className="text-center py-6 text-sm text-slate-400 animate-pulse">
                Carregando avaliações...
              </div>
            ) : commentsWithText.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400 italic">
                Nenhum comentário em texto registrado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commentsWithText.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/50 flex flex-col justify-between gap-2"
                  >
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">
                      "{getComment(item)}"
                    </p>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                      <span>Usuário Anônimo</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Rodapé com Instagram Oficial */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-16 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 space-y-4">
        <div className="flex justify-center items-center gap-2">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 rounded-full font-medium transition-colors"
            title="Instagram Oficial"
          >
            <Instagram className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Siga-nos no Instagram</span>
          </a>
        </div>
        <p>PropedeuticaPDF &copy; {new Date().getFullYear()} - Processamento 100% local e seguro.</p>
      </footer>
    </div>
  );
};

export default Home;
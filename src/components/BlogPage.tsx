import { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  ChevronRight,
  Camera,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { translations } from '../i18n/translations';

interface BlogPageProps {
  onNavigate: (page: string, articleSlug?: string) => void;
}

interface Article {
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  date: string;
  readTime: Record<string, string>;
  category: Record<string, string>;
  keywords: Record<string, string[]>;
}

const articles: Article[] = [
  {
    slug: 'how-to-extract-frames-from-video-free-2025',
    title: {
      'en': 'How to Extract Frames from Video for Free (2025)',
      'zh-CN': '如何免费从视频中提取帧 (2025)',
      'zh-TW': '如何免費從視頻中提取幀 (2025)',
      'ja': '動画を無料でフレーム抽出する方法 (2025)',
      'ko': '동영상에서 프레임을 무료로 추출하는 방법 (2025)',
      'fr': 'Comment extraire des images de vidéo gratuitement (2025)',
      'de': 'So extrahieren Sie Frames kostenlos aus Videos (2025)',
      'es': 'Cómo extraer fotogramas de video gratis (2025)',
      'pt': 'Como extrair quadros de vídeo gratuitamente (2025)',
      'it': 'Come estrarre fotogrammi da video gratuitamente (2025)'
    },
    excerpt: {
      'en': 'Learn the easiest ways to extract frames from any video without spending a dime. Discover free tools, step-by-step guides, and expert tips for 2025.',
      'zh-CN': '了解从任何视频中提取帧的最简单方法，无需花费一分钱。探索2025年的免费工具、分步指南和专家技巧。',
      'zh-TW': '了解從任何視頻中提取幀的最簡單方法，無需花費一分錢。探索2025年的免費工具、分步指南和專家技巧。',
      'ja': 'お金をかけずに任意の動画からフレームを抽出する最も簡単な方法を学びましょう。2025年の無料ツール、ステップバイステップガイド、専門家のヒントを発見してください。',
      'ko': '돈을 쓰지 않고도 모든 동영상에서 프레임을 추출하는 가장 쉬운 방법을 알아보세요. 2025년 무료 도구, 단계별 가이드, 전문가 팁을 발견하세요.',
      'fr': 'Apprenez les moyens les plus simples d\'extraire des images de n\'importe quelle vidéo sans dépenser un centime.',
      'de': 'Lernen Sie die einfachsten Methoden, Frames aus jedem Video kostenlos zu extrahieren.',
      'es': 'Aprende las formas más fáciles de extraer fotogramas de cualquier video sin gastar dinero.',
      'pt': 'Aprenda as maneiras mais fáceis de extrair quadros de qualquer vídeo sem gastar dinheiro.',
      'it': 'Impara i modi più semplici per estrarre fotogrammi da qualsiasi video senza spendere soldi.'
    },
    date: '2025-01-15',
    readTime: {
      'en': '8 min read',
      'zh-CN': '8 分钟阅读',
      'zh-TW': '8 分鐘閱讀',
      'ja': '8分で読める',
      'ko': '8분 소요',
      'fr': '8 min de lecture',
      'de': '8 Min. Lesezeit',
      'es': '8 min de lectura',
      'pt': '8 min de leitura',
      'it': '8 min di lettura'
    },
    category: {
      'en': 'Tutorial',
      'zh-CN': '教程',
      'zh-TW': '教程',
      'ja': 'チュートリアル',
      'ko': '튜토리얼',
      'fr': 'Tutoriel',
      'de': 'Anleitung',
      'es': 'Tutorial',
      'pt': 'Tutorial',
      'it': 'Tutorial'
    },
    keywords: {
      'en': ['video frame extraction', 'free tools', 'screenshots', 'video to images'],
      'zh-CN': ['视频帧提取', '免费工具', '截图', '视频转图片'],
      'zh-TW': ['視頻幀提取', '免費工具', '截圖', '視頻轉圖片'],
      'ja': ['動画フレーム抽出', '無料ツール', 'スクリーンショット', '動画を画像に'],
      'ko': ['동영상 프레임 추출', '무료 도구', '스크린샷', '동영상을 이미지로'],
      'fr': ['extraction de frames vidéo', 'outils gratuits', 'captures d\'écran', 'vidéo vers images'],
      'de': ['Video-Frame-Extraktion', 'kostenlose Tools', 'Screenshots', 'Video zu Bilder'],
      'es': ['extracción de fotogramas de video', 'herramientas gratuitas', 'capturas de pantalla', 'video a imágenes'],
      'pt': ['extração de quadros de vídeo', 'ferramentas gratuitas', 'capturas de tela', 'vídeo para imagens'],
      'it': ['estrazione fotogrammi video', 'strumenti gratuiti', 'screenshot', 'da video a immagini']
    }
  },
  {
    slug: 'best-free-video-frame-extractor-tools',
    title: {
      'en': 'Best Free Video Frame Extractor Tools',
      'zh-CN': '最佳免费视频帧提取工具',
      'zh-TW': '最佳免費視頻幀提取工具',
      'ja': '最高の無料動画フレーム抽出ツール',
      'ko': '최고의 무료 동영상 프레임 추출 도구',
      'fr': 'Meilleurs outils gratuits d\'extraction de frames',
      'de': 'Beste kostenlose Video-Frame-Extraktoren',
      'es': 'Mejores herramientas gratuitas de extracción de fotogramas',
      'pt': 'Melhores ferramentas gratuitas de extração de quadros',
      'it': 'Migliori strumenti gratuiti per l\'estrazione di fotogrammi'
    },
    excerpt: {
      'en': 'Compare the top free video frame extraction tools available in 2025. From browser-based solutions to desktop apps, find the perfect tool for your needs.',
      'zh-CN': '比较2025年可用的最佳免费视频帧提取工具。从基于浏览器的解决方案到桌面应用，找到适合您需求的完美工具。',
      'zh-TW': '比較2025年可用的最佳免費視頻幀提取工具。從基於瀏覽器的解決方案到桌面應用，找到適合您需求的完美工具。',
      'ja': '2025年利用可能な最高の無料動画フレーム抽出ツールを比較。ブラウザベースのソリューションからデスクトップアプリまで、ニーズに合った完璧なツールを見つけましょう。',
      'ko': '2025년 사용 가능한 최고의 무료 동영상 프레임 추출 도구를 비교하세요. 브라우저 기반 솔루션부터 데스크톱 앱까지, 필요에 맞는 완벽한 도구를 찾으세요.',
      'fr': 'Comparez les meilleurs outils gratuits d\'extraction de frames vidéo disponibles en 2025.',
      'de': 'Vergleichen Sie die besten kostenlosen Video-Frame-Extraktionstools von 2025.',
      'es': 'Compara las mejores herramientas gratuitas de extracción de fotogramas de video disponibles en 2025.',
      'pt': 'Compare as melhores ferramentas gratuitas de extração de quadros de vídeo disponíveis em 2025.',
      'it': 'Confronta i migliori strumenti gratuiti di estrazione fotogrammi video disponibili nel 2025.'
    },
    date: '2025-01-12',
    readTime: {
      'en': '10 min read',
      'zh-CN': '10 分钟阅读',
      'zh-TW': '10 分鐘閱讀',
      'ja': '10分で読める',
      'ko': '10분 소요',
      'fr': '10 min de lecture',
      'de': '10 Min. Lesezeit',
      'es': '10 min de lectura',
      'pt': '10 min de leitura',
      'it': '10 min di lettura'
    },
    category: {
      'en': 'Comparison',
      'zh-CN': '对比',
      'zh-TW': '對比',
      'ja': '比較',
      'ko': '비교',
      'fr': 'Comparaison',
      'de': 'Vergleich',
      'es': 'Comparación',
      'pt': 'Comparação',
      'it': 'Confronto'
    },
    keywords: {
      'en': ['frame extractor', 'video tools', 'free software', 'comparison'],
      'zh-CN': ['帧提取器', '视频工具', '免费软件', '对比'],
      'zh-TW': ['幀提取器', '視頻工具', '免費軟件', '對比'],
      'ja': ['フレーム抽出', '動画ツール', '無料ソフトウェア', '比較'],
      'ko': ['프레임 추출기', '동영상 도구', '무료 소프트웨어', '비교'],
      'fr': ['extracteur de frames', 'outils vidéo', 'logiciel gratuit', 'comparaison'],
      'de': ['Frame-Extraktor', 'Video-Tools', 'kostenlose Software', 'Vergleich'],
      'es': ['extractor de fotogramas', 'herramientas de video', 'software gratuito', 'comparación'],
      'pt': ['extrator de quadros', 'ferramentas de vídeo', 'software gratuito', 'comparação'],
      'it': ['estrattore di fotogrammi', 'strumenti video', 'software gratuito', 'confronto']
    }
  },
  {
    slug: 'how-to-use-vidtill-for-video-screenshots',
    title: {
      'en': 'How to Use Vidtill for Video Screenshots',
      'zh-CN': '如何使用 Vidtill 进行视频截图',
      'zh-TW': '如何使用 Vidtill 進行視頻截圖',
      'ja': 'Vidtillで動画スクリーンショットを使用する方法',
      'ko': 'Vidtill을 사용하여 동영상 스크린샷을 만드는 방법',
      'fr': 'Comment utiliser Vidtill pour les captures d\'écran vidéo',
      'de': 'So verwenden Sie Vidtill für Video-Screenshots',
      'es': 'Cómo usar Vidtill para capturas de pantalla de video',
      'pt': 'Como usar o Vidtill para capturas de tela de vídeo',
      'it': 'Come usare Vidtill per screenshot video'
    },
    excerpt: {
      'en': 'A comprehensive guide to using Vidtill for extracting high-quality frames from your videos. Learn all features, tips, and tricks for best results.',
      'zh-CN': '使用 Vidtill 从视频中提取高质量帧的综合指南。学习所有功能、技巧和诀窍，获得最佳效果。',
      'zh-TW': '使用 Vidtill 從視頻中提取高質量幀的綜合指南。學習所有功能、技巧和竅門，獲得最佳效果。',
      'ja': 'Vidtillで動画から高品質フレームを抽出するための総合ガイド。すべての機能、ヒント、テクニックを学びましょう。',
      'ko': 'Vidtill을 사용하여 동영상에서 고품질 프레임을 추출하는 종합 가이드입니다. 모든 기능, 팁, 요령을 알아보세요.',
      'fr': 'Un guide complet pour utiliser Vidtill afin d\'extraire des images de haute qualité de vos vidéos.',
      'de': 'Ein umfassender Leitfaden zur Verwendung von Vidtill für hochwertige Frames aus Ihren Videos.',
      'es': 'Una guía completa para usar Vidtill y extraer fotogramas de alta calidad de tus videos.',
      'pt': 'Um guia completo para usar o Vidtill para extrair quadros de alta qualidade dos seus vídeos.',
      'it': 'Una guida completa all\'uso di Vidtill per estrarre fotogrammi di alta qualità dai tuoi video.'
    },
    date: '2025-01-10',
    readTime: {
      'en': '6 min read',
      'zh-CN': '6 分钟阅读',
      'zh-TW': '6 分鐘閱讀',
      'ja': '6分で読める',
      'ko': '6분 소요',
      'fr': '6 min de lecture',
      'de': '6 Min. Lesezeit',
      'es': '6 min de lectura',
      'pt': '6 min de leitura',
      'it': '6 min di lettura'
    },
    category: {
      'en': 'Guide',
      'zh-CN': '指南',
      'zh-TW': '指南',
      'ja': 'ガイド',
      'ko': '가이드',
      'fr': 'Guide',
      'de': 'Anleitung',
      'es': 'Guía',
      'pt': 'Guia',
      'it': 'Guida'
    },
    keywords: {
      'en': ['Vidtill', 'video screenshots', 'tutorial', 'how-to'],
      'zh-CN': ['Vidtill', '视频截图', '教程', '使用方法'],
      'zh-TW': ['Vidtill', '視頻截圖', '教程', '使用方法'],
      'ja': ['Vidtill', '動画スクリーンショット', 'チュートリアル', '使い方'],
      'ko': ['Vidtill', '동영상 스크린샷', '튜토리얼', '사용법'],
      'fr': ['Vidtill', 'captures d\'écran vidéo', 'tutoriel', 'comment faire'],
      'de': ['Vidtill', 'Video-Screenshots', 'Tutorial', 'Anleitung'],
      'es': ['Vidtill', 'capturas de pantalla de video', 'tutorial', 'cómo hacer'],
      'pt': ['Vidtill', 'capturas de tela de vídeo', 'tutorial', 'como fazer'],
      'it': ['Vidtill', 'screenshot video', 'tutorial', 'come fare']
    }
  },
  {
    slug: 'why-local-processing-better-for-privacy',
    title: {
      'en': 'Why Local Processing Is Better for Privacy',
      'zh-CN': '为什么本地处理对隐私更好',
      'zh-TW': '為什麼本地處理對隱私更好',
      'ja': 'ローカル処理がプライバシーにより良い理由',
      'ko': '로컬 처리가 프라이버시에 더 나은 이유',
      'fr': 'Pourquoi le traitement local est meilleur pour la confidentialité',
      'de': 'Warum lokale Verarbeitung besser für die Privatsphäre ist',
      'es': 'Por qué el procesamiento local es mejor para la privacidad',
      'pt': 'Por que o processamento local é melhor para a privacidade',
      'it': 'Perché l\'elaborazione locale è migliore per la privacy'
    },
    excerpt: {
      'en': 'Discover why browser-based, local video processing protects your privacy better than cloud-based solutions. Keep your videos secure and private.',
      'zh-CN': '了解为什么基于浏览器的本地视频处理比云端解决方案更好地保护您的隐私。确保您的视频安全私密。',
      'zh-TW': '了解為什麼基於瀏覽器的本地視頻處理比雲端解決方案更好地保護您的隱私。確保您的視頻安全私密。',
      'ja': 'ブラウザベースのローカル動画処理がクラウドベースのソリューションよりもプライバシーをよりよく保護する理由を発見してください。',
      'ko': '브라우저 기반 로컬 동영상 처리가 클라우드 기반 솔루션보다 프라이버시를 더 잘 보호하는 이유를 알아보세요.',
      'fr': 'Découvrez pourquoi le traitement vidéo local basé sur le navigateur protège mieux votre vie privée.',
      'de': 'Entdecken Sie, warum browserbasierte lokale Videoverarbeitung Ihre Privatsphäre besser schützt.',
      'es': 'Descubra por qué el procesamiento de video local basado en navegador protege mejor su privacidad.',
      'pt': 'Descubra por que o processamento de vídeo local baseado em navegador protege melhor sua privacidade.',
      'it': 'Scopri perché l\'elaborazione video locale basata su browser protegge meglio la tua privacy.'
    },
    date: '2025-01-08',
    readTime: {
      'en': '7 min read',
      'zh-CN': '7 分钟阅读',
      'zh-TW': '7 分鐘閱讀',
      'ja': '7分で読める',
      'ko': '7분 소요',
      'fr': '7 min de lecture',
      'de': '7 Min. Lesezeit',
      'es': '7 min de lectura',
      'pt': '7 min de leitura',
      'it': '7 min di lettura'
    },
    category: {
      'en': 'Privacy',
      'zh-CN': '隐私',
      'zh-TW': '隱私',
      'ja': 'プライバシー',
      'ko': '프라이버시',
      'fr': 'Confidentialité',
      'de': 'Datenschutz',
      'es': 'Privacidad',
      'pt': 'Privacidade',
      'it': 'Privacy'
    },
    keywords: {
      'en': ['privacy', 'local processing', 'security', 'data protection'],
      'zh-CN': ['隐私', '本地处理', '安全', '数据保护'],
      'zh-TW': ['隱私', '本地處理', '安全', '數據保護'],
      'ja': ['プライバシー', 'ローカル処理', 'セキュリティ', 'データ保護'],
      'ko': ['프라이버시', '로컬 처리', '보안', '데이터 보호'],
      'fr': ['confidentialité', 'traitement local', 'sécurité', 'protection des données'],
      'de': ['Datenschutz', 'lokale Verarbeitung', 'Sicherheit', 'Datenschutz'],
      'es': ['privacidad', 'procesamiento local', 'seguridad', 'protección de datos'],
      'pt': ['privacidade', 'processamento local', 'segurança', 'proteção de dados'],
      'it': ['privacy', 'elaborazione locale', 'sicurezza', 'protezione dei dati']
    }
  },
  {
    slug: 'frame-extraction-for-ai-datasets-design',
    title: {
      'en': 'Frame Extraction for AI Datasets & Design',
      'zh-CN': '用于 AI 数据集和设计的帧提取',
      'zh-TW': '用於 AI 數據集和設計的幀提取',
      'ja': 'AIデータセットとデザインのフレーム抽出',
      'ko': 'AI 데이터셋 및 디자인을 위한 프레임 추출',
      'fr': 'Extraction de frames pour les datasets IA et le design',
      'de': 'Frame-Extraktion für KI-Datensätze & Design',
      'es': 'Extracción de fotogramas para conjuntos de datos de IA y diseño',
      'pt': 'Extração de quadros para conjuntos de dados de IA e design',
      'it': 'Estrazione di fotogrammi per dataset AI e design'
    },
    excerpt: {
      'en': 'Learn how to extract and prepare video frames for AI training datasets, design projects, and creative workflows. Professional techniques revealed.',
      'zh-CN': '了解如何为 AI 训练数据集、设计项目和创意工作流程提取和准备视频帧。专业技巧大公开。',
      'zh-TW': '了解如何為 AI 訓練數據集、設計項目和創意工作流程提取和準備視頻幀。專業技巧大公開。',
      'ja': 'AIトレーニングデータセット、デザインプロジェクト、クリエイティブワークフロー向けに動画フレームを抽出して準備する方法を学びましょう。',
      'ko': 'AI 교육 데이터셋, 디자인 프로젝트, 크리에이티브 워크플로우를 위해 동영상 프레임을 추출하고 준비하는 방법을 알아보세요.',
      'fr': 'Apprenez à extraire et préparer des frames vidéo pour les datasets d\'entraînement IA.',
      'de': 'Lernen Sie, wie Sie Video-Frames für KI-Trainingsdatensätze und Design-Projekte extrahieren.',
      'es': 'Aprende a extraer y preparar fotogramas de video para conjuntos de datos de entrenamiento de IA.',
      'pt': 'Aprenda a extrair e preparar quadros de vídeo para conjuntos de dados de treinamento de IA.',
      'it': 'Impara come estrarre e preparare fotogrammi video per dataset di training AI e progetti di design.'
    },
    date: '2025-01-05',
    readTime: {
      'en': '9 min read',
      'zh-CN': '9 分钟阅读',
      'zh-TW': '9 分鐘閱讀',
      'ja': '9分で読める',
      'ko': '9분 소요',
      'fr': '9 min de lecture',
      'de': '9 Min. Lesezeit',
      'es': '9 min de lectura',
      'pt': '9 min de leitura',
      'it': '9 min di lettura'
    },
    category: {
      'en': 'Professional',
      'zh-CN': '专业',
      'zh-TW': '專業',
      'ja': 'プロフェッショナル',
      'ko': '전문가',
      'fr': 'Professionnel',
      'de': 'Professionell',
      'es': 'Profesional',
      'pt': 'Profissional',
      'it': 'Professionale'
    },
    keywords: {
      'en': ['AI datasets', 'machine learning', 'design', 'frame extraction'],
      'zh-CN': ['AI数据集', '机器学习', '设计', '帧提取'],
      'zh-TW': ['AI數據集', '機器學習', '設計', '幀提取'],
      'ja': ['AIデータセット', '機械学習', 'デザイン', 'フレーム抽出'],
      'ko': ['AI 데이터셋', '머신 러닝', '디자인', '프레임 추출'],
      'fr': ['datasets IA', 'apprentissage automatique', 'design', 'extraction de frames'],
      'de': ['KI-Datensätze', 'maschinelles Lernen', 'Design', 'Frame-Extraktion'],
      'es': ['conjuntos de datos de IA', 'aprendizaje automático', 'diseño', 'extracción de fotogramas'],
      'pt': ['conjuntos de dados de IA', 'aprendizado de máquina', 'design', 'extração de quadros'],
      'it': ['dataset AI', 'machine learning', 'design', 'estrazione fotogrammi']
    }
  }
];

export function BlogPage({ onNavigate }: BlogPageProps) {
  const { currentLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  const t = (key: string) => {
    const langData = (translations as any)[currentLanguage]?.blog || (translations as any)['en']?.blog || {};
    return langData[key] || (translations as any)['en']?.blog?.[key] || key;
  };

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const handleArticleClick = (slug: string) => {
    onNavigate('article', slug);
  };

  const handleBackToHome = () => {
    onNavigate('app');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[150px]"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)',
            top: '10%',
            left: '-10%',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)',
            bottom: '10%',
            right: '-5%',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button 
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">{t('backToHome')}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="relative p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-400/40">
                <Camera className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Vid</span>
                <span className="text-zinc-500">till</span>
                <span className="text-zinc-600 ml-2">Blog</span>
              </span>
            </div>

            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div 
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-full border border-amber-400/40 mb-6 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-200">{t('subtitle')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight">
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                {t('title')}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="relative pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <article
                key={article.slug}
                onClick={() => handleArticleClick(article.slug)}
                className={`group relative bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-700 hover:border-amber-500/50 transition-all duration-500 hover:scale-[1.02] overflow-hidden shadow-2xl shadow-black/50 cursor-pointer ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative p-6">
                  {/* Category Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 mb-4">
                    <span className="text-xs font-semibold text-amber-400">{article.category[currentLanguage] || article.category['en']}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold mb-3 text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {article.title[currentLanguage] || article.title['en']}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                    {article.excerpt[currentLanguage] || article.excerpt['en']}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.readTime[currentLanguage] || article.readTime['en']}</span>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(article.keywords[currentLanguage] || article.keywords['en']).slice(0, 3).map((keyword) => (
                      <span 
                        key={keyword}
                        className="px-2 py-1 bg-zinc-800/80 rounded text-xs text-zinc-400"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  {/* Read More Link */}
                  <div className="flex items-center gap-2 text-amber-400 group-hover:text-amber-300 transition-colors">
                    <span className="text-sm font-semibold">{t('readArticle')}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 sm:py-16 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
            {t('ctaTitle')}
          </h2>
          <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
            {t('ctaDescription')}
          </p>
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all duration-300 hover:scale-105 shadow-xl shadow-amber-500/30"
          >
            <Camera className="w-5 h-5" />
            <span>{t('startExtracting')}</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-400/40">
                <Camera className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-lg font-bold">
                <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Vid</span>
                <span className="text-zinc-500">till</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500">
              {t('footer')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

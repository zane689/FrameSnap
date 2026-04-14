import { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Camera,
  Sparkles,
  CheckCircle2,
  Share2,
  Check,
  Globe
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { translations } from '../i18n/translations';

interface BlogArticleProps {
  slug: string;
  onNavigate: (page: string, articleSlug?: string) => void;
}

interface ArticleContent {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  keywords: string[];
  content: React.ReactNode;
}

const articleContents: Record<string, ArticleContent> = {
  'how-to-extract-frames-from-video-free-2025': {
    slug: 'how-to-extract-frames-from-video-free-2025',
    title: 'How to Extract Frames from Video for Free (2025)',
    date: '2025-01-15',
    readTime: '8 min read',
    category: 'Tutorial',
    keywords: ['video frame extraction', 'free tools', 'screenshots', 'video to images'],
    content: (
      <>
        <p className="text-lg text-zinc-300 leading-relaxed mb-6">
          Extracting frames from videos has become an essential skill for content creators, designers, and anyone working with visual media. Whether you need a perfect screenshot from a movie, frames for AI training data, or images for your design projects, this comprehensive guide will show you exactly how to extract frames from any video for free in 2025.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Why Extract Frames from Videos?</h2>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Video frame extraction serves numerous purposes across different industries:
        </p>
        <ul className="space-y-3 mb-6">
          {[
            'Content Creation: Capture perfect moments for thumbnails, social media posts, or blog illustrations',
            'Design Projects: Extract high-quality images for presentations, mockups, or creative compositions',
            'AI & Machine Learning: Build training datasets with diverse visual data',
            'Documentation: Create step-by-step visual guides from tutorial videos',
            'Archiving: Preserve specific moments from important footage'
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zinc-300">
              <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Method 1: Using Vidtill (Browser-Based)</h2>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Vidtill offers the easiest way to extract frames without installing any software. Here's how:
        </p>
        <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700 mb-6">
          <ol className="space-y-4">
            {[
              'Navigate to Vidtill and click "Start Extracting"',
              'Upload your video file (supports MP4, MOV, AVI, WebM formats)',
              'Use the extraction wizard to choose your preferred method:',
              '  • Time Interval: Extract frames every X seconds',
              '  • Frame Interval: Extract every Nth frame',
              '  • Fixed FPS: Extract at a specific frame rate',
              '  • Precise Mode: Select exact timestamps',
              'Preview and select the frames you want to keep',
              'Download as individual images or ZIP archive'
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-300">
                <span className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold flex-shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Method 2: VLC Media Player</h2>
        <p className="text-zinc-300 leading-relaxed mb-4">
          VLC is a powerful free option for desktop users:
        </p>
        <ol className="space-y-3 mb-6 text-zinc-300">
          <li>1. Open your video in VLC</li>
          <li>2. Go to Tools → Preferences → Video</li>
          <li>3. Set "Video Snapshots" directory</li>
          <li>4. Use Shift+S to capture frames manually</li>
          <li>5. Or use the command line for batch extraction</li>
        </ol>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Method 3: FFmpeg (Command Line)</h2>
        <p className="text-zinc-300 leading-relaxed mb-4">
          For advanced users, FFmpeg provides maximum control:
        </p>
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 mb-6 font-mono text-sm">
          <code className="text-amber-400">
            ffmpeg -i input.mp4 -vf "fps=1" output_%04d.png
          </code>
          <p className="text-zinc-500 mt-2 text-xs">Extracts 1 frame per second</p>
        </div>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Tips for Best Results</h2>
        <ul className="space-y-3 mb-6">
          {[
            'Choose the right format: PNG for quality, JPG for smaller files',
            'Match extraction rate to your needs: 1 fps for overview, 30 fps for smooth sequences',
            'Consider video resolution: Higher resolution = better frame quality',
            'Use batch processing for multiple videos',
            'Organize frames with consistent naming conventions'
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-zinc-300">
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">FAQ</h2>
        <div className="space-y-4 mb-6">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <h3 className="font-semibold text-white mb-2">Is video frame extraction legal?</h3>
            <p className="text-zinc-400 text-sm">Yes, for personal use and content you own. Always respect copyright laws when using extracted frames.</p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <h3 className="font-semibold text-white mb-2">What's the best free tool for beginners?</h3>
            <p className="text-zinc-400 text-sm">Vidtill is recommended for beginners due to its intuitive interface and no installation requirement.</p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <h3 className="font-semibold text-white mb-2">Can I extract frames from any video format?</h3>
            <p className="text-zinc-400 text-sm">Most modern tools support MP4, MOV, AVI, and WebM. For rare formats, convert first using HandBrake.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20 mt-8">
          <h3 className="text-xl font-bold text-white mb-3">Ready to Start Extracting?</h3>
          <p className="text-zinc-300 mb-4">
            Try Vidtill's free video frame extractor now. No registration required, works entirely in your browser, and keeps your videos private.
          </p>
          <a href="/" className="inline-flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors">
            <Camera className="w-5 h-5" />
            <span>Launch Vidtill Frame Extractor →</span>
          </a>
        </div>
      </>
    )
  },
  'best-free-video-frame-extractor-tools': {
    slug: 'best-free-video-frame-extractor-tools',
    title: 'Best Free Video Frame Extractor Tools',
    date: '2025-01-12',
    readTime: '10 min read',
    category: 'Comparison',
    keywords: ['frame extractor', 'video tools', 'free software', 'comparison'],
    content: (
      <>
        <p className="text-lg text-zinc-300 leading-relaxed mb-6">
          With so many video frame extraction tools available, choosing the right one can be overwhelming. We've tested and compared the best free options for 2025 to help you find the perfect tool for your needs.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Top 5 Free Video Frame Extractors</h2>

        <div className="space-y-6 mb-8">
          {/* Tool 1 */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700 hover:border-amber-500/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-white">1. Vidtill</h3>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">Best Overall</span>
            </div>
            <p className="text-zinc-300 mb-3">Browser-based tool with no installation required. Perfect for quick extractions with privacy in mind.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Browser-based', 'No upload', 'Multiple formats', 'Batch processing'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400">{tag}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-emerald-400">✓ Pros:</span>
                <ul className="text-zinc-400 mt-1 space-y-1">
                  <li>• No software installation</li>
                  <li>• Complete privacy (local processing)</li>
                  <li>• Intuitive interface</li>
                </ul>
              </div>
              <div>
                <span className="text-rose-400">✗ Cons:</span>
                <ul className="text-zinc-400 mt-1 space-y-1">
                  <li>• Requires modern browser</li>
                  <li>• Limited by RAM for large files</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tool 2 */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700 hover:border-amber-500/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-white">2. VLC Media Player</h3>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">Best Desktop</span>
            </div>
            <p className="text-zinc-300 mb-3">The Swiss Army knife of media players also excels at frame extraction.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Cross-platform', 'Format support', 'Command line', 'Reliable'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400">{tag}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-emerald-400">✓ Pros:</span>
                <ul className="text-zinc-400 mt-1 space-y-1">
                  <li>• Supports virtually all formats</li>
                  <li>• Completely free and open source</li>
                  <li>• No internet required</li>
                </ul>
              </div>
              <div>
                <span className="text-rose-400">✗ Cons:</span>
                <ul className="text-zinc-400 mt-1 space-y-1">
                  <li>• Manual extraction only</li>
                  <li>• Steep learning curve</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tool 3 */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700 hover:border-amber-500/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-white">3. FFmpeg</h3>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">Best for Power Users</span>
            </div>
            <p className="text-zinc-300 mb-3">The industry standard for video processing with unmatched flexibility.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Command line', 'Scriptable', 'Professional', 'Lightning fast'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400">{tag}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-emerald-400">✓ Pros:</span>
                <ul className="text-zinc-400 mt-1 space-y-1">
                  <li>• Maximum control and options</li>
                  <li>• Batch processing capabilities</li>
                  <li>• Extremely fast</li>
                </ul>
              </div>
              <div>
                <span className="text-rose-400">✗ Cons:</span>
                <ul className="text-zinc-400 mt-1 space-y-1">
                  <li>• Command line only</li>
                  <li>• Complex syntax</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tool 4 */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700 hover:border-amber-500/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-white">4. VirtualDub</h3>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-semibold">Best for AVI</span>
            </div>
            <p className="text-zinc-300 mb-3">Classic video processing tool with excellent frame extraction features.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Windows', 'AVI specialist', 'Filters', 'Lightweight'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400">{tag}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-emerald-400">✓ Pros:</span>
                <ul className="text-zinc-400 mt-1 space-y-1">
                  <li>• Excellent for AVI files</li>
                  <li>• Video filtering options</li>
                  <li>• Very lightweight</li>
                </ul>
              </div>
              <div>
                <span className="text-rose-400">✗ Cons:</span>
                <ul className="text-zinc-400 mt-1 space-y-1">
                  <li>• Windows only</li>
                  <li>• Dated interface</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tool 5 */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700 hover:border-amber-500/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-white">5. HandBrake</h3>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold">Best Converter</span>
            </div>
            <p className="text-zinc-300 mb-3">Primarily a video converter, but includes frame extraction capabilities.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Transcoder', 'Presets', 'Cross-platform', 'Open source'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400">{tag}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-emerald-400">✓ Pros:</span>
                <ul className="text-zinc-400 mt-1 space-y-1">
                  <li>• Excellent conversion options</li>
                  <li>• User-friendly interface</li>
                  <li>• Regular updates</li>
                </ul>
              </div>
              <div>
                <span className="text-rose-400">✗ Cons:</span>
                <ul className="text-zinc-400 mt-1 space-y-1">
                  <li>• Not designed for frame extraction</li>
                  <li>• Limited extraction options</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Comparison Table</h2>
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">Tool</th>
                <th className="text-center py-3 px-4 text-zinc-400 font-medium">Ease of Use</th>
                <th className="text-center py-3 px-4 text-zinc-400 font-medium">Speed</th>
                <th className="text-center py-3 px-4 text-zinc-400 font-medium">Features</th>
                <th className="text-center py-3 px-4 text-zinc-400 font-medium">Best For</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800">
                <td className="py-3 px-4 font-medium text-white">Vidtill</td>
                <td className="text-center py-3 px-4 text-emerald-400">★★★★★</td>
                <td className="text-center py-3 px-4 text-emerald-400">★★★★☆</td>
                <td className="text-center py-3 px-4 text-emerald-400">★★★★☆</td>
                <td className="text-center py-3 px-4">Quick extractions</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-3 px-4 font-medium text-white">VLC</td>
                <td className="text-center py-3 px-4 text-amber-400">★★★☆☆</td>
                <td className="text-center py-3 px-4 text-emerald-400">★★★★☆</td>
                <td className="text-center py-3 px-4 text-amber-400">★★★☆☆</td>
                <td className="text-center py-3 px-4">Desktop users</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-3 px-4 font-medium text-white">FFmpeg</td>
                <td className="text-center py-3 px-4 text-rose-400">★★☆☆☆</td>
                <td className="text-center py-3 px-4 text-emerald-400">★★★★★</td>
                <td className="text-center py-3 px-4 text-emerald-400">★★★★★</td>
                <td className="text-center py-3 px-4">Power users</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-3 px-4 font-medium text-white">VirtualDub</td>
                <td className="text-center py-3 px-4 text-amber-400">★★★☆☆</td>
                <td className="text-center py-3 px-4 text-emerald-400">★★★★☆</td>
                <td className="text-center py-3 px-4 text-amber-400">★★★☆☆</td>
                <td className="text-center py-3 px-4">AVI files</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">HandBrake</td>
                <td className="text-center py-3 px-4 text-emerald-400">★★★★☆</td>
                <td className="text-center py-3 px-4 text-amber-400">★★★☆☆</td>
                <td className="text-center py-3 px-4 text-amber-400">★★☆☆☆</td>
                <td className="text-center py-3 px-4">Conversion + extraction</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Our Recommendation</h2>
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20 mb-6">
          <p className="text-zinc-300 leading-relaxed">
            For most users, we recommend starting with <strong className="text-white">Vidtill</strong> for its ease of use and privacy-focused approach. If you need more advanced features or work offline regularly, <strong className="text-white">VLC</strong> or <strong className="text-white">FFmpeg</strong> are excellent choices.
          </p>
        </div>

        <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700 mt-8">
          <h3 className="text-xl font-bold text-white mb-3">Try Vidtill Now</h3>
          <p className="text-zinc-300 mb-4">
            Experience the easiest way to extract frames from your videos. No installation, no upload, 100% free.
          </p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all duration-300">
            <Camera className="w-5 h-5" />
            <span>Start Extracting Frames</span>
          </a>
        </div>
      </>
    )
  },
  'how-to-use-vidtill-for-video-screenshots': {
    slug: 'how-to-use-vidtill-for-video-screenshots',
    title: 'How to Use Vidtill for Video Screenshots',
    date: '2025-01-10',
    readTime: '6 min read',
    category: 'Guide',
    keywords: ['Vidtill', 'video screenshots', 'tutorial', 'how-to'],
    content: (
      <>
        <p className="text-lg text-zinc-300 leading-relaxed mb-6">
          Vidtill is designed to make video frame extraction as simple as possible. This comprehensive guide will walk you through every feature and help you get the most out of this free tool.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Getting Started</h2>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Vidtill runs entirely in your browser, which means:
        </p>
        <ul className="space-y-2 mb-6">
          {[
            'No software installation required',
            'Your videos never leave your computer',
            'Works on Windows, Mac, and Linux',
            'No registration or account needed'
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-zinc-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Step-by-Step Guide</h2>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">1. Upload Your Video</h3>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Click the upload area or drag and drop your video file. Vidtill supports MP4, MOV, AVI, and WebM formats up to 2GB.
        </p>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">2. Choose Extraction Mode</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {[
            { title: 'Time Interval', desc: 'Extract frames every X seconds', icon: '⏱️' },
            { title: 'Frame Interval', desc: 'Extract every Nth frame', icon: '🎞️' },
            { title: 'Fixed FPS', desc: 'Extract at specific frame rate', icon: '📊' },
            { title: 'Precise', desc: 'Select exact timestamps', icon: '🎯' }
          ].map((mode, i) => (
            <div key={i} className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
              <div className="text-2xl mb-2">{mode.icon}</div>
              <h4 className="font-semibold text-white mb-1">{mode.title}</h4>
              <p className="text-sm text-zinc-400">{mode.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">3. Preview and Select</h3>
        <p className="text-zinc-300 leading-relaxed mb-4">
          After extraction, you'll see all frames in a grid. Click to select multiple frames, or use the selection bar to manage your choices.
        </p>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">4. Download Options</h3>
        <ul className="space-y-3 mb-6">
          {[
            'Individual downloads: Save frames one by one',
            'Batch ZIP: Download all selected frames as a ZIP file',
            'Long image: Combine 3-9 frames into a cinematic strip',
            'Format options: PNG, JPG, WebP with quality control'
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zinc-300">
              <span className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold flex-shrink-0">{i + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Pro Tips</h2>
        <div className="space-y-4 mb-6">
          <div className="bg-zinc-900/50 rounded-lg p-4 border-l-4 border-amber-500">
            <h4 className="font-semibold text-white mb-2">Keyboard Shortcuts</h4>
            <p className="text-zinc-400 text-sm">Space: Play/Pause | Arrow keys: Navigate frames | Delete: Remove selected</p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-4 border-l-4 border-amber-500">
            <h4 className="font-semibold text-white mb-2">Best Quality Settings</h4>
            <p className="text-zinc-400 text-sm">Use PNG for maximum quality, JPG 90%+ for web use, WebP for best compression</p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-4 border-l-4 border-amber-500">
            <h4 className="font-semibold text-white mb-2">Large Video Handling</h4>
            <p className="text-zinc-400 text-sm">For videos over 500MB, extract in smaller segments to avoid browser memory limits</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Troubleshooting</h2>
        <div className="space-y-4 mb-6">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <h4 className="font-semibold text-white mb-2">Video won't load?</h4>
            <p className="text-zinc-400 text-sm">Ensure your video is in a supported format (MP4, MOV, AVI, WebM). Try re-encoding with HandBrake if issues persist.</p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <h4 className="font-semibold text-white mb-2">Extraction is slow?</h4>
            <p className="text-zinc-400 text-sm">Close other browser tabs and applications. For faster extraction, use the frame interval mode with larger intervals.</p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <h4 className="font-semibold text-white mb-2">Browser crashes?</h4>
            <p className="text-zinc-400 text-sm">Your video may be too large. Try extracting shorter segments or use a desktop tool like VLC for very large files.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20 mt-8">
          <h3 className="text-xl font-bold text-white mb-3">Ready to Try Vidtill?</h3>
          <p className="text-zinc-300 mb-4">
            Start extracting frames from your videos in seconds. No registration required.
          </p>
          <a href="/" className="inline-flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors">
            <Camera className="w-5 h-5" />
            <span>Launch Vidtill Now →</span>
          </a>
        </div>
      </>
    )
  },
  'why-local-processing-better-for-privacy': {
    slug: 'why-local-processing-better-for-privacy',
    title: 'Why Local Processing Is Better for Privacy',
    date: '2025-01-08',
    readTime: '7 min read',
    category: 'Privacy',
    keywords: ['privacy', 'local processing', 'security', 'data protection'],
    content: (
      <>
        <p className="text-lg text-zinc-300 leading-relaxed mb-6">
          In an era where data privacy concerns are at an all-time high, understanding how your video processing tools handle your data is crucial. This article explores why browser-based, local processing is the gold standard for privacy-conscious users.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">The Privacy Problem with Cloud Processing</h2>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Most online video tools require you to upload your files to remote servers. This creates several privacy risks:
        </p>
        <ul className="space-y-3 mb-6">
          {[
            'Your videos are stored on third-party servers, often in different countries',
            'Processing happens on shared infrastructure with other users',
            'Data retention policies may keep your files longer than expected',
            'Potential for data breaches or unauthorized access',
            'Your content may be used to train AI models without consent',
            'Metadata and usage patterns are typically logged and analyzed'
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zinc-300">
              <span className="w-6 h-6 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-400 text-sm flex-shrink-0">✗</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">How Local Processing Works</h2>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Browser-based local processing tools like Vidtill operate entirely differently:
        </p>
        <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700 mb-6">
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📁</span>
              </div>
              <h4 className="font-semibold text-white mb-2">1. Select</h4>
              <p className="text-sm text-zinc-400">You select a video from your device</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💻</span>
              </div>
              <h4 className="font-semibold text-white mb-2">2. Process</h4>
              <p className="text-sm text-zinc-400">Processing happens in your browser</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⬇️</span>
              </div>
              <h4 className="font-semibold text-white mb-2">3. Download</h4>
              <p className="text-sm text-zinc-400">Results saved directly to your device</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Key Privacy Benefits</h2>
        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-emerald-500/10 to-transparent rounded-lg p-4 border-l-4 border-emerald-500">
            <h4 className="font-semibold text-white mb-2">Zero Upload</h4>
            <p className="text-zinc-400 text-sm">Your video never leaves your computer. No internet upload means no server storage, no transmission risks, and no third-party access.</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-500/10 to-transparent rounded-lg p-4 border-l-4 border-emerald-500">
            <h4 className="font-semibold text-white mb-2">No Data Retention</h4>
            <p className="text-zinc-400 text-sm">Since nothing is uploaded, there's nothing to retain. Your data exists only in your browser's temporary memory and is cleared when you close the tab.</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-500/10 to-transparent rounded-lg p-4 border-l-4 border-emerald-500">
            <h4 className="font-semibold text-white mb-2">No Account Required</h4>
            <p className="text-zinc-400 text-sm">Local processing tools don't need your email, name, or any personal information. You're completely anonymous.</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-500/10 to-transparent rounded-lg p-4 border-l-4 border-emerald-500">
            <h4 className="font-semibold text-white mb-2">Transparent Operation</h4>
            <p className="text-zinc-400 text-sm">Open-source local tools let you verify exactly what code is running. No hidden data collection or tracking.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Use Cases Requiring Maximum Privacy</h2>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Local processing is essential for:
        </p>
        <ul className="space-y-2 mb-6">
          {[
            'Legal professionals working with sensitive evidence footage',
            'Medical practitioners handling patient video records',
            'Journalists protecting source materials',
            'Businesses processing confidential training videos',
            'Individuals with personal family videos',
            'Researchers with unpublished study footage'
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-zinc-300">
              <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Technical Deep Dive</h2>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Modern browsers support powerful APIs that enable local video processing:
        </p>
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 mb-6">
          <ul className="space-y-2 text-sm text-zinc-400 font-mono">
            <li>• File API: Direct file access without upload</li>
            <li>• Canvas API: Frame rendering and image generation</li>
            <li>• WebCodecs: Hardware-accelerated video decoding</li>
            <li>• Web Workers: Background processing without blocking UI</li>
            <li>• IndexedDB: Local temporary storage</li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">How to Verify a Tool is Truly Local</h2>
        <ol className="space-y-3 mb-6">
          {[
            'Check if the tool works offline after initial load',
            'Monitor network traffic - local tools show minimal data transfer',
            'Review the privacy policy for upload mentions',
            'Check if account creation is required',
            'Look for open-source code that can be audited'
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zinc-300">
              <span className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold flex-shrink-0">{i + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>

        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl p-6 border border-emerald-500/20 mt-8">
          <h3 className="text-xl font-bold text-white mb-3">Experience True Privacy with Vidtill</h3>
          <p className="text-zinc-300 mb-4">
            Vidtill processes everything locally in your browser. Your videos never touch our servers, and no account is required. Try it now and experience privacy-first video frame extraction.
          </p>
          <a href="/" className="inline-flex items-center gap-2 text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
            <span>Try Vidtill's Private Frame Extractor →</span>
          </a>
        </div>
      </>
    )
  },
  'frame-extraction-for-ai-datasets-design': {
    slug: 'frame-extraction-for-ai-datasets-design',
    title: 'Frame Extraction for AI Datasets & Design',
    date: '2025-01-05',
    readTime: '9 min read',
    category: 'Professional',
    keywords: ['AI datasets', 'machine learning', 'design', 'frame extraction'],
    content: (
      <>
        <p className="text-lg text-zinc-300 leading-relaxed mb-6">
          Video frame extraction has become an essential technique for AI practitioners and designers alike. Whether you're building training datasets for computer vision models or sourcing assets for creative projects, understanding professional frame extraction workflows can dramatically improve your results.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Frame Extraction for AI & Machine Learning</h2>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Quality training data is the foundation of successful AI models. Video frames offer several advantages over static image collections:
        </p>
        <ul className="space-y-3 mb-6">
          {[
            'Temporal diversity: Capture objects in various positions and states',
            'Natural variation: Real-world lighting, angles, and contexts',
            'Cost efficiency: One video can yield thousands of training images',
            'Consistency: Same scene conditions across multiple frames',
            'Scalability: Easy to generate large datasets quickly'
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zinc-300">
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Best Practices for AI Dataset Creation</h2>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">1. Frame Selection Strategy</h3>
        <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700 mb-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-emerald-400 mb-2">✓ Do</h4>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>• Extract at 1-5 fps for object detection</li>
                <li>• Include diverse scenes and conditions</li>
                <li>• Maintain aspect ratio consistency</li>
                <li>• Capture multiple object orientations</li>
                <li>• Include negative examples</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-rose-400 mb-2">✗ Don't</h4>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>• Extract too many similar frames</li>
                <li>• Use heavily compressed source videos</li>
                <li>• Ignore class balance</li>
                <li>• Forget augmentation opportunities</li>
                <li>• Overlook annotation requirements</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">2. Quality Considerations</h3>
        <p className="text-zinc-300 leading-relaxed mb-4">
          For AI training, image quality directly impacts model performance:
        </p>
        <ul className="space-y-2 mb-6">
          {[
            'Resolution: Minimum 640x480 for most applications, higher for detail-critical tasks',
            'Format: PNG for lossless quality, JPG 95%+ if file size is a concern',
            'Compression: Avoid double compression - extract from highest quality source',
            'Artifacts: Check for motion blur and compression artifacts',
            'Consistency: Maintain uniform quality across the dataset'
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zinc-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Frame Extraction for Design Workflows</h2>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Designers use video frames for various creative purposes:
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {[
            { title: 'Mood Boards', desc: 'Capture color palettes and visual styles from films', icon: '🎨' },
            { title: 'Reference Sheets', desc: 'Study motion, poses, and compositions', icon: '📋' },
            { title: 'Texture Sources', desc: 'Extract organic textures and patterns', icon: '🖼️' },
            { title: 'Storyboarding', desc: 'Build sequences from video references', icon: '🎬' },
            { title: 'Social Content', desc: 'Create engaging stills from video content', icon: '📱' },
            { title: 'Presentation Assets', desc: 'High-quality visuals for decks', icon: '📊' }
          ].map((use, i) => (
            <div key={i} className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
              <div className="text-2xl mb-2">{use.icon}</div>
              <h4 className="font-semibold text-white mb-1">{use.title}</h4>
              <p className="text-sm text-zinc-400">{use.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Professional Workflow Tips</h2>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">Organizing Extracted Frames</h3>
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 mb-6 font-mono text-sm">
          <p className="text-zinc-500 mb-2"># Recommended folder structure:</p>
          <code className="text-amber-400">
            project_name/<br/>
            ├── raw_frames/<br/>
            │   ├── scene_01/<br/>
            │   ├── scene_02/<br/>
            │   └── ...<br/>
            ├── selected/<br/>
            │   ├── for_training/<br/>
            │   └── for_design/<br/>
            └── annotations/<br/>
          </code>
        </div>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">Naming Conventions</h3>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Consistent naming helps with organization and automation:
        </p>
        <ul className="space-y-2 mb-6 text-zinc-300">
          <li><code className="bg-zinc-800 px-2 py-1 rounded text-amber-400">project_scene_frame_0001.png</code> - Sequential numbering</li>
          <li><code className="bg-zinc-800 px-2 py-1 rounded text-amber-400">class_video_timestamp.jpg</code> - Timestamp-based</li>
          <li><code className="bg-zinc-800 px-2 py-1 rounded text-amber-400">YYYYMMDD_description_001.png</code> - Date-based</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Tools for Professional Workflows</h2>
        <div className="space-y-4 mb-6">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <h4 className="font-semibold text-white mb-2">For AI Datasets</h4>
            <p className="text-zinc-400 text-sm mb-2">Vidtill + Python scripts for batch processing and augmentation</p>
            <div className="flex flex-wrap gap-2">
              {['Vidtill', 'Python', 'OpenCV', 'Albumentations'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-500">{tag}</span>
              ))}
            </div>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <h4 className="font-semibold text-white mb-2">For Design Work</h4>
            <p className="text-zinc-400 text-sm mb-2">Vidtill for extraction + Adobe CC/Figma for design work</p>
            <div className="flex flex-wrap gap-2">
              {['Vidtill', 'Photoshop', 'Figma', 'After Effects'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-500">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Advanced Techniques</h2>
        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg p-4 border-l-4 border-purple-500">
            <h4 className="font-semibold text-white mb-2">Scene Detection</h4>
            <p className="text-zinc-400 text-sm">Use scene change detection to automatically extract representative frames from each scene, ensuring dataset diversity.</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold text-white mb-2">Smart Sampling</h4>
            <p className="text-zinc-400 text-sm">Instead of fixed intervals, use motion-based sampling to capture more frames during action and fewer during static scenes.</p>
          </div>
          <div className="bg-gradient-to-r from-amber-500/10 to-transparent rounded-lg p-4 border-l-4 border-amber-500">
            <h4 className="font-semibold text-white mb-2">Batch Augmentation</h4>
            <p className="text-zinc-400 text-sm">Apply rotations, flips, and color adjustments to extracted frames to artificially expand your dataset.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20 mt-8">
          <h3 className="text-xl font-bold text-white mb-3">Start Your Professional Workflow</h3>
          <p className="text-zinc-300 mb-4">
            Vidtill provides the precise control needed for professional frame extraction. Extract at exact intervals, maintain quality, and export in formats ready for your AI or design pipeline.
          </p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all duration-300">
            <span>Try Vidtill for Professional Use</span>
          </a>
        </div>
      </>
    )
  }
};

export function BlogArticle({ slug, onNavigate }: BlogArticleProps) {
  const { currentLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const article = articleContents[slug];

  const t = (key: string) => {
    const langData = (translations as any)[currentLanguage]?.blog || (translations as any)['en']?.blog || {};
    return langData[key] || (translations as any)['en']?.blog?.[key] || key;
  };

  // Get article translation data
  const getArticleTranslation = (articleSlug: string) => {
    const langData = (translations as any)[currentLanguage]?.blog?.articles || {};
    const enData = (translations as any)['en']?.blog?.articles || {};
    return langData[articleSlug] || enData[articleSlug] || null;
  };

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, [slug]);

  const handleBackToBlog = () => {
    onNavigate('blog');
  };

  const handleBackToHome = () => {
    onNavigate('app');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('notFoundTitle')}</h1>
          <button
            onClick={handleBackToBlog}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            ← {t('backToBlog')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[150px]"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)',
            top: '5%',
            right: '-10%',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-amber-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button 
              onClick={handleBackToBlog}
              className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">{t('backToBlog')}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="relative p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-400/40">
                <Camera className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Vid</span>
                <span className="text-zinc-500">till</span>
              </span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
              <span className="text-sm font-medium hidden sm:inline">{copied ? t('copied') : t('share')}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <header className="relative pt-24 sm:pt-32 pb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">{article.category}</span>
            </div>

            {/* Title - Use translated title if available */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
              {getArticleTranslation(slug)?.title || article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-6">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-2">
              {article.keywords.map((keyword) => (
                <span 
                  key={keyword}
                  className="px-3 py-1 bg-zinc-800/80 rounded-full text-xs text-zinc-400 border border-zinc-700"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Language Notice Banner - Show when not in English */}
      {currentLanguage !== 'en' && (
        <div className="relative pb-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
              <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 text-sm">{t('languageNotice')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="relative pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`prose prose-invert prose-zinc max-w-none transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {article.content}
          </div>
        </div>
      </article>

      {/* CTA Section */}
      <section className="relative py-12 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">
            {t('ctaTitle')}
          </h2>
          <p className="text-zinc-400 mb-6">
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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

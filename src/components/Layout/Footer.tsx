import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-auto py-8 px-4 sm:px-6 lg:px-8 border-t border-white/10"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold gradient-text">TCG League</h3>
            <p className="text-white/70 text-sm">
              Competitive One Piece TCG tournament management and deck building platform.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <div className="space-y-2">
              <a href="/" className="block text-white/70 hover:text-white text-sm transition-colors">
                Home
              </a>
              <a href="/events" className="block text-white/70 hover:text-white text-sm transition-colors">
                Events
              </a>
              <a href="/deck-builder" className="block text-white/70 hover:text-white text-sm transition-colors">
                Deck Builder
              </a>
              <a href="/news" className="block text-white/70 hover:text-white text-sm transition-colors">
                News
              </a>
            </div>
          </div>

          {/* Official Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Official Resources</h4>
            <div className="space-y-2">
              <a 
                href="https://onepiece-cardgame.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white/70 hover:text-white text-sm transition-colors"
              >
                <span>One Piece TCG Official</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://en.bandai.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white/70 hover:text-white text-sm transition-colors"
              >
                <span>Bandai Official</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://limitlesstcg.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white/70 hover:text-white text-sm transition-colors"
              >
                <span>Limitless TCG</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          {/* Copyright Disclaimer */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-6 mb-6 border-2 border-yellow-500/20">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-yellow-500/30 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="text-lg font-semibold text-yellow-300">Copyright Notice</h5>
                <p className="text-sm text-white/90 leading-relaxed">
                  The content found on this website pertaining to the <strong>One Piece Trading Card Game</strong>, including card images and text, is subject to copyright held by <strong>Bandai Namco</strong> and/or <strong>Bandai</strong>.
                </p>
                <p className="text-sm text-white/80 leading-relaxed">
                  This website is independently created and is <strong>neither produced by, endorsed by, supported by, nor affiliated with</strong> One Piece, Bandai Namco, and/or Bandai.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-white/60">
              © {new Date().getFullYear()} TCG League. For educational and portfolio purposes.
            </div>
            <div className="flex items-center space-x-6 text-sm text-white/60">
              <span>Made with ❤️ for the One Piece TCG community</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

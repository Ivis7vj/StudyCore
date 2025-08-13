import { useTheme } from "@/components/ui/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Header() {
  const { theme, setTheme, isLight } = useTheme();
  const [location] = useLocation();

  const toggleTheme = () => {
    setTheme(isLight ? "dark" : "light");
  };

  return (
    <nav className="border-b border-border bg-gradient-to-r from-background to-dark-secondary backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center animate-slide-in-left">
            <Link href="/">
              <h1 className="font-orbitron text-3xl font-bold gradient-text studycore-glow cursor-pointer hover:scale-105 transition-transform duration-300">
                STUDYCORE
              </h1>
            </Link>
            <span className="ml-3 text-muted-foreground text-sm font-poppins animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              AI Study Companion
            </span>
          </div>
          
          <div className="hidden md:flex space-x-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Link href="/">
              <span className={`nav-link ${location === '/' ? 'text-neon-cyan animate-pulse-glow' : 'text-foreground hover:text-neon-cyan'} transition-all duration-300 font-orbitron cursor-pointer hover:scale-105`}>
                DASHBOARD
              </span>
            </Link>
            <Link href="/history">
              <span className={`nav-link ${location === '/history' ? 'text-neon-cyan animate-pulse-glow' : 'text-foreground hover:text-neon-cyan'} transition-all duration-300 font-orbitron cursor-pointer hover:scale-105`}>
                HISTORY
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4 animate-slide-in-right">
            <button
              onClick={toggleTheme}
              className="studycore-button px-4 py-2 text-sm hover-lift animate-float"
              style={{ animationDelay: '0.3s' }}
              data-testid="button-theme-toggle"
            >
              {isLight ? (
                <>
                  <Sun className="w-4 h-4 mr-2 animate-pulse-glow" />
                  LIGHT
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2 animate-pulse-glow" />
                  DARK
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

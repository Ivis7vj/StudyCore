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
    <nav className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="font-orbitron text-3xl font-bold text-neon-cyan text-glow-pulse cursor-pointer">
                STUDYCORE
              </h1>
            </Link>
            <span className="ml-3 text-muted-foreground text-sm">AI Study Companion</span>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/">
              <span className={`nav-link ${location === '/' ? 'text-neon-cyan' : 'text-foreground hover:text-neon-cyan'} transition-colors font-orbitron cursor-pointer`}>
                DASHBOARD
              </span>
            </Link>
            <Link href="/history">
              <span className={`nav-link ${location === '/history' ? 'text-neon-cyan' : 'text-foreground hover:text-neon-cyan'} transition-colors font-orbitron cursor-pointer`}>
                HISTORY
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="studycore-button px-4 py-2 text-sm"
              data-testid="button-theme-toggle"
            >
              {isLight ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  LIGHT
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
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

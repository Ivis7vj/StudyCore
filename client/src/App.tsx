import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Topics from "@/pages/topics";
import TopicDetail from "@/pages/topic-detail";
import History from "@/pages/history";
import Simulations from "@/pages/simulations";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/topics/:documentId" component={Topics} />
      <Route path="/topic/:topicId" component={TopicDetail} />
      <Route path="/history" component={History} />
      <Route path="/simulations" component={Simulations} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="studycore-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground transition-all duration-300">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

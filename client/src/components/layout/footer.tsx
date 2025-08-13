export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground font-poppins">
            &copy; 2024 StudyCore. Advanced AI Study Assistant.
          </p>
          <div className="flex space-x-4">
            <span className="text-neon-cyan font-orbitron text-sm">
              API STATUS: CONNECTED
            </span>
            <span className="text-neon-green font-orbitron text-sm">
              SYSTEM: ONLINE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

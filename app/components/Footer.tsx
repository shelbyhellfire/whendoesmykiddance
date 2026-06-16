export default function Footer() {
  return (
    <footer className="w-full py-6 px-4 bg-purple-600/90 backdrop-blur-sm border-t border-white/20 mt-auto">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-white/90">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://shelbyramseth.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline hover:text-white transition-colors"
          >
            Shelby Ramseth
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}

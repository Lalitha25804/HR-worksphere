const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">

        <p className="text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="text-white font-semibold">HRWorkSphere</span>. All rights reserved.
        </p>

        <div className="flex space-x-6 text-sm">
          <span className="hover:text-white cursor-pointer">Privacy</span>
          <span className="hover:text-white cursor-pointer">Terms</span>
          <span className="hover:text-white cursor-pointer">Support</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
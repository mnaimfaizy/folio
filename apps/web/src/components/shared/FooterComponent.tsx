import {
  BookOpen,
  Facebook,
  Github,
  Instagram,
  Twitter,
  Mail,
  ArrowRight,
  Heart,
  Linkedin,
  Youtube,
  Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/context/SettingsContext';

// Map platform names to icons
const socialIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  youtube: Youtube,
};

export function FooterComponent() {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  return (
    <footer className="relative overflow-hidden">
      {/* Main Footer */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950">
        {/* Newsletter Section */}
        <div className="border-b border-slate-800">
          <div className="container mx-auto px-4 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-md">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Stay updated with new releases
                </h3>
                <p className="text-slate-400 text-sm">
                  Subscribe to our newsletter and never miss out on new books
                  and exclusive offers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-grow md:w-72">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <Button className="h-12 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/20 group">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Logo and About */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center space-x-3 mb-4 group">
                <div className="relative">
                  {settings.logo_url ? (
                    <img
                      src={settings.logo_url}
                      alt={settings.site_name || 'Logo'}
                      className="h-9 w-auto object-contain"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                    </>
                  )}
                </div>
                <span className="text-lg font-bold text-white">
                  {settings.site_name || 'Folio'}
                  <span className="text-blue-400">Library</span>
                </span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {settings.site_description ||
                  'Your one-stop solution for managing library resources, discovering new books, and connecting with fellow readers.'}
              </p>
              <div className="flex space-x-3">
                {settings.social_links && settings.social_links.length > 0
                  ? settings.social_links.map((social, index) => {
                      const Icon = socialIcons[social.platform] || Globe;
                      return (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.platform}
                          className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-200"
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      );
                    })
                  : // Default social links
                    [
                      {
                        icon: Facebook,
                        href: 'https://facebook.com',
                        label: 'Facebook',
                      },
                      {
                        icon: Twitter,
                        href: 'https://twitter.com',
                        label: 'Twitter',
                      },
                      {
                        icon: Instagram,
                        href: 'https://instagram.com',
                        label: 'Instagram',
                      },
                      {
                        icon: Github,
                        href: 'https://github.com',
                        label: 'GitHub',
                      },
                    ].map(({ icon: Icon, href, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-200"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Explore
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Home', href: '/', show: true },
                  { label: 'Books', href: '/books', show: true },
                  { label: 'Categories', href: '/books', show: true },
                  {
                    label: 'About Us',
                    href: '/about',
                    show: settings.show_about_page,
                  },
                  {
                    label: 'Contact',
                    href: '/contact',
                    show: settings.show_contact_page,
                  },
                  // Include custom footer links from settings
                  ...(settings.footer_links || []).map((link) => ({
                    label: link.label,
                    href: link.url,
                    show: true,
                  })),
                ]
                  .filter((item) => item.show)
                  .map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        to={href}
                        className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 h-0.5 bg-blue-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                        {label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Help & Support */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Support
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Help Center', href: '/support' },
                  { label: 'FAQ', href: '/faq' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Privacy Policy', href: '/privacy' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-blue-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Account
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Sign In', href: '/login' },
                  { label: 'Create Account', href: '/signup' },
                  { label: 'My Books', href: '/my-books' },
                  { label: 'Profile Settings', href: '/profile' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-blue-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800">
          <div className="container mx-auto px-4 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-slate-500 text-sm">
                {settings.footer_text ||
                  `© ${currentYear} ${settings.site_name || 'FolioLibrary'}. All rights reserved.`}
              </p>
              <p className="text-slate-500 text-sm flex items-center">
                Made with{' '}
                <Heart className="h-4 w-4 mx-1 text-red-500 fill-red-500" /> for
                book lovers
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

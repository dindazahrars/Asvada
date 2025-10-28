'use client';

import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: 'About',
      links: ['Featured', 'Partnership', 'Business Relation']
    },
    {
      title: 'Community',
      links: ['Events', 'Blog', 'Podcast', 'Invite a Friend']
    },
    {
      title: 'Socials',
      links: ['Discord', 'Instagram', 'Twitter', 'Facebook']
    }
  ];

  const socialIcons = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' }
  ];

  return (
    <footer className="bg-gradient-to-br from-[#902E2B] to-[#6b2220] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold">Asvada</span>
            </div>
            <p className="text-gray-200 mb-6 leading-relaxed">
              Platform resep masakan terlengkap di Indonesia. Temukan ribuan resep lezat dan mudah untuk setiap momen spesialmu.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <Mail className="w-4 h-4 text-[#FE9412]" />
                <span>hello@asvada.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <Phone className="w-4 h-4 text-[#FE9412]" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <MapPin className="w-4 h-4 text-[#FE9412]" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-lg mb-4 text-[#FE9412]">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-200 hover:text-[#FE9412] transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 border-opacity-20 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-200">
            © 2025 Asvada. All rights reserved.
          </p>

          {/* Social Media Icons */}
          <div className="flex items-center gap-4">
            {socialIcons.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="p-2 bg-white bg-opacity-10 rounded-full hover:bg-[#FE9412] transition-colors"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-4 text-sm text-gray-200">
            <a href="#" className="hover:text-[#FE9412] transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-[#FE9412] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
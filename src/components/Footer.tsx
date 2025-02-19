import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// import { FacebookLogo, InstagramLogo, LinkedinLogo, XLogo, YoutubeLogo } from './Icons';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'hsla(203, 79%, 94%, 0.5)' }} className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-end">
          {/* Left Column - Logo and Contact */}
          <div className="w-full mb-8 lg:mb-0 flex flex-col items-center lg:items-start md:items-start">
            <Link href="/" className="block mb-8">
              <Image
                src="/logo.svg"
                alt="Aswaq Online"
                width={150}
                height={50}
                className="h-auto"
              />
            </Link>

            {/* <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Address:</h3>
                <p>Level 1, 12 Sample St, Sydney NSW 2000</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Contact:</h3>
                <Link href="tel:1800123456" className="hover:underline">
                  1800 123 4567
                </Link>
              </div> */}

              {/* Social Media Links */}
              {/* <div className="flex space-x-4 mt-6">
                <Link href="#" className="hover:opacity-80 hover:text-primary">
                  <FacebookLogo className="w-6 h-6" />
                </Link>
                <Link href="#" className="hover:opacity-80 hover:text-primary">
                  <InstagramLogo className="w-6 h-6" />
                </Link>
                <Link href="#" className="hover:opacity-80 hover:text-primary">
                  <XLogo className="w-6 h-6" />
                </Link>
                <Link href="#" className="hover:opacity-80 hover:text-primary">
                  <LinkedinLogo className="w-6 h-6" />
                </Link>
                <Link href="#" className="hover:opacity-80 hover:text-primary">
                  <YoutubeLogo className="w-6 h-6" />
                </Link>
              </div>
            </div> */}
          </div>

          {/* Right Column - Navigation Links */}
            <ul className="space-y-2 w-full flex flex-col items-center lg:items-end md:items-end justify-end">
              <li><Link href="/about-us" className="text-muted-foreground hover:text-primary">About us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact us</Link></li>
              <li><Link href="/help" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
              <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">Terms of use</Link></li>
              <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            </ul>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-6 border-t">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <p className="text-sm mb-4 lg:mb-0">
              © 2025 Aswaq. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-section-gap max-w-container-max mx-auto">
        <div className="col-span-1">
          <span className="font-display-lg text-headline-md text-primary block mb-6">Lumina Stay</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
            Elevating the travel experience through meticulous curation and impeccable service standards.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h5 className="font-label-caps text-label-caps text-on-background uppercase">Platform</h5>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">About Us</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Sustainability</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Help Center</a>
        </div>
        <div className="flex flex-col gap-4">
          <h5 className="font-label-caps text-label-caps text-on-background uppercase">Legal</h5>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Privacy Policy</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Terms of Service</a>
        </div>
        <div className="flex flex-col gap-4">
          <h5 className="font-label-caps text-label-caps text-on-background uppercase">Connect</h5>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">public</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">share</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">contact_support</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-4">© 2024 Lumina Stay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

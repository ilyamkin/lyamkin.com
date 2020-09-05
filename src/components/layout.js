import React from 'react'
import { Link } from 'gatsby'

const Layout = ({ title, children }) => (
  <div className="p-0 mx-auto flex flex-col h-full max-w-full sm:px-8">
    <header
      className="flex items-center justify-between px-8"
      style={{ minHeight: '4rem' }}
    >
      <Link className="shadow-none text-gray-900 uppercase font-bold" to={`/`}>
        {title}
      </Link>
      <div>
        <Link className="mr-4" to={`/blog`}>
          Blog
        </Link>
        <Link className="mr-4" to={`/about`}>
          About
        </Link>
      </div>
    </header>
    <main className="px-8 flex-1 mx-auto w-full" style={{ maxWidth: '744px' }}>
      {children}
    </main>
    <footer className="mb-4 text-center">
      © {new Date().getFullYear()}, Built with ❤️ at 🌍
    </footer>
  </div>
)

export default Layout

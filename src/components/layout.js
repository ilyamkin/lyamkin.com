import React from "react"
import { Link } from "gatsby"
import "./layout.css"

class Layout extends React.Component {
  render() {
    const { title, children } = this.props

    return (
      <div className='layout'>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '4rem',
            padding: '0 2rem',
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}
            to={`/`}
          >
            {title}
          </Link>
          <div>
            <Link
              style={{
                marginRight: '1rem',
              }}
              to={`/blog`}
            >
              Blog
            </Link>
            <Link
              style={{
                marginRight: '1rem',
              }}
              to={`/about`}
            >
              About
            </Link>
            <a href='/resume.pdf' download>
              CV
            </a>
          </div>
        </header>
        <main
          style={{
            padding: `0 2rem`,
            flex: '1',
            maxWidth: '744px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children}
        </main>
        <footer style={{
          textAlign: 'center',
          marginBottom: '1rem',
        }}>
          © {new Date().getFullYear()}, Built with ❤️ at 🌍
        </footer>
      </div>
    )
  }
}

export default Layout

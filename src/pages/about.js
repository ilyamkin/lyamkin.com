import React from 'react'
import { graphql } from 'gatsby'

import Layout from '../components/layout'
import SEO from '../components/seo'

class NotFoundPage extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="Ilya Lyamkin | About" />
        <h1>About</h1>
        <p>
          I'm a product-driven software engineer with a focus on web
          architecture and performance.
        </p>
        <p>
          I was born in 1995 and grew up in Russia. After graduating High School
          I went to{' '}
          <a
            href="https://en.itmo.ru/en/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {' '}
            ITMO University
          </a>{' '}
          where I graduated with a Bachelor degree in Computer Science.
        </p>
        <p>
          My experience includes building highly-scalable, robust, and
          fault-tolerant services that support unique exponential growth
          requirements. I've written code for{' '}
          <a
            href="https://spotify.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Spotify
          </a>
          ,{' '}
          <a
            href="https://free-now.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            FREE NOW
          </a>
          ,{' '}
          <a
            href="https://www.meruhealth.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meru Health
          </a>
          ,{' '}
          <a
            href="https://meyvndigital.co.uk/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meyvn Digital
          </a>
          , and{' '}
          <a
            href="https://www.t-systems.com/de/en"
            target="_blank"
            rel="noopener noreferrer"
          >
            T-Systems
          </a>
          .
        </p>
        <p>
          Occasionally I write about Web Development on various platforms
          including: <a href="https://twitter.com/ilyamkin">Twitter</a>,{' '}
          <a
            href="https://medium.com/@ilyamkin"
            target="_blank"
            rel="noopener noreferrer"
          >
            Medium
          </a>
          ,{' '}
          <a
            href="https://dev.to/ilyamkin"
            target="_blank"
            rel="noopener noreferrer"
          >
            dev.to
          </a>
          .
        </p>
      </Layout>
    )
  }
}

export default NotFoundPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`

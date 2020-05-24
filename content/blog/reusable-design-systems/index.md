---
title: Truly Reusable Design Systems in Practice
date: '2020-01-02T00:00:00.000Z'
description: What makes a great design system — and how can you create your own for your project or company?
featuredImage: design-systems.jpg
featuredImageAlt: Truly Reusable Design Systems in Practice
---

Companies like Airbnb, Apple, Uber, and GitHub have changed the ways they design digital products by incorporating their design language and organizing it into a system that can be used across all employees — and even outside of the company.

It quickly became popular in the whole industry: Just google the company’s name and the word “design” next to it, and you’d be surprised by how many companies have something similar. [Airbnb Design](https://airbnb.design/the-way-we-build/), [Apple Design](https://developer.apple.com/design/), [Uber Base Web](https://baseweb.design/), [GitHub Primer](https://primer.style/) — these are the examples of good design systems.

We won't be talking today about the reasoning behind having a company-wide design system or the organizational challenges that come with it (though it’ll be definitely covered later, so stay tuned). Instead, we’ll focus on the technical choices and implementation details.

# Traits of a Good Design System

A good design system is a collection of reusable components — guided by clear standards — that can be assembled together to build any number of applications. Let’s try to split this definition into actionable traits we want to prioritize and focus on from a technical perspective.

## Reusable components

Generally speaking, the design system is a set of shared components that’ll be used by everyone.

Imagine you have several independent teams in the company, and some of them use vanilla JS. Another team uses React, and even another group is experimenting with Svelte. As a creator of a design system, you have to build components for these frameworks and think about flexibility in the feature, so you won’t lock other developers in a specific ecosystem.

## Extensive documentation

To ensure the smooth adoption of your design system, you’ll have to provide thought-through, easy-to-use documentation with examples and best practices.

How do you do this? First, a website with all components and their descriptions would help. Second, it’d be amazing if you could provide guidance about possible arguments and use cases for your components directly in the developer’s IDE.

## Performance-oriented

So you’re about to ask your fellow developers to add this design system as a dependency and probably replace something that’s already working, make sure to keep the number of dependencies as low as possible, preferably zero, so you won't bloat the package size of all projects.

Try to rely on a browser API or CSS and be closer to browser-native behavior because less custom JS code means faster components.

## Maintain the highest quality

You also need to ensure your design system won’t break on a new release. Apart from doing code review and manual testing, I’d encourage everyone to look at automated tests. For presentational components, consider [screenshot testing](https://storybook.js.org/docs/testing/automated-visual-testing/). For stateful ones, write integration and end-to-end tests.

# StencilJS and Web Components to the Rescue

If you’re wondering how you’re going to cover everything from the list above without spending a month setting up the architecture, I have something to suggest.

[StencilJS](https://stenciljs.com/) is a toolchain for creating reusable, scalable design systems built on top of Web Components. It provides a complete set of tools to start working on your design system right now and makes it easy to work with Web Components.

The components created with Stencil are fully compatible with browser standards and can be run in any framework, including just a plain HTML file. You can use [output targets](https://stenciljs.com/docs/output-targets) to add a custom website that’ll showcase your work. It also features [screenshot testing](https://stenciljs.com/docs/screenshot-visual-diff) (apart from e2e and Jest integration).

Let’s dive into it, and see how easy it is to build a simple-yet-stateful component.

## Introducing the fetch button

The core component of any design system is a button. But since just a button would be too simple, we’ll make it powerful enough to also fetch data from any endpoint you specify in its attributes and return data via browser events.

To start, run the Stencil generator: `npm init stencil`. It’ll ask you to pick a starter. Choose Component. That’ll generate a folder with a simple test component so you can start playing with it (`npm install && npm start`).

In the `src/components` folder, you’ll find the `my-component` folder. Rename it to `fetch-button` — as well as the `css` and `tsx` files inside of it. The CSS file is responsible for the styling of our button, so let’s add some styles:

```css
button {
  color: #24292e;
  background-image: linear-gradient(-180deg, #fafbfc 0%, #eff3f6 90%);

  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  cursor: pointer;
  border-radius: 0.25em;
}
```

Now go to the `tsx` file. This is the actual component we need to build.

```tsx
import {
  Component,
  Prop,
  h,
  Listen,
  State,
  Event,
  EventEmitter,
} from '@stencil/core'

@Component({
  tag: 'fetch-button',
  styleUrl: 'fetch-button.css',
  shadow: true,
})
export class MyComponent {
  /**
   * URL to fetch
   */
  @Prop() url: string

  /**
   * The query status
   */
  @State() status: string

  @Event() success: EventEmitter
  @Event() error: EventEmitter

  @Listen('click', { capture: true })
  handleClick() {
    this.status = 'pending'

    fetch(this.url)
      .then(response => response.json())
      .then(data => {
        this.success.emit(data)
        this.status = 'success'
      })
      .catch(error => {
        this.error.emit(error)
        this.status = 'error'
      })
  }

  render() {
    return (
      <div>
        <button>
          <slot />
        </button>
        <div>Status: {this.status}</div>
      </div>
    )
  }
}
```

Before the component class, we need to add a decorator specifying the tag name, a path to the style file.

Then inside of the class, we need to define a `prop` called `url`. It’ll work as an HTML attribute and allow us to pass data to the component.

The next line creates a state variable: Every time we change it, the render function will rerun.

The `@Eventdirective` registers two events for us: `onSuccess` and `onError`.

`@Listen` helps us to listen to click events and execute the corresponding function. In our case, we’ll call the native fetch function and update the state and trigger events depending on the outcome.

Finally, the `render` function defines the DOM that‘ll’ be created. The `<slot />` tag will be replaced by `<fetch-button>` children.

That’s it. Now let’s see how we can use it.

```html
<!DOCTYPE html>
<html dir="ltr" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0"
    />
    <title>Fetch Button Demo</title>

    <script type="module" src="/build/designsystem.esm.js"></script>
    <script nomodule src="/build/designsystem.js"></script>

    <script
      src="https://unpkg.com/react@16/umd/react.development.js"
      crossorigin
    ></script>
    <script
      src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"
      crossorigin
    ></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <fetch-button url="https://jsonplaceholder.typicode.com/todos/1">
      Fetch my data from vanilla JS
    </fetch-button>
    <script>
      const fetchButton = document.querySelector('fetch-button')
      fetchButton.addEventListener('success', console.log)
    </script>

    <div id="root"></div>
    <script type="text/babel">
      ReactDOM.render(
        <fetch-button
          ref={el => el.addEventListener('success', console.log)}
          className="react"
          url="https://jsonplaceholder.typicode.com/todos/1"
          onSuccess={console.log}
        >
          Fetch data from React
        </fetch-button>,
        document.getElementById('root')
      )
    </script>
  </body>
</html>
```

Apart from the native HTML example, I’ve added integration with React. As you can see, it’s as easy as writing plain `div` elements.

# Known Complexities

Now, it’s time to talk about the downsides of using Web Components.

The most important one is the lack of good framework support. For example, in React, you can’t attach event listeners to your component.

As a workaround, you can attach a native event using the `ref` property — which is what I did in the example above. The [Custom Elements Everywhere](https://custom-elements-everywhere.com/) website shows the compatibility Web Components has with popular frameworks.

# Conclusion

Before starting working on the design system, evaluate the values you want to focus on. Maybe you don’t need to have it at all and just properly organized shared components would be enough for you.

If you’ve decided to incorporate the system, Web Components perfectly solves challenges that stand before design systems and is a great technology to build your components upon.

StencilJS makes it easy to manage and deliver components for different targets. But with all that in mind, beware and explore the still-standing issues regarding framework support.

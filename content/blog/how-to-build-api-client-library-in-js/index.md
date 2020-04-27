---
title: How to Build an API Client Library in JS
date: "2020-04-27T00:00:00.000Z"
description: Introducing the dev-to-js library
---

<div align="center">
<img src="https://i.imgur.com/HzCCU11.png" width="250"/>
</div>

Every time I find myself connecting to a third-party API that doesn't have a client library I have to create a lot of boilerplate around it:

- Manually getting and passing authentication credentials to the data fetching layer. What if you want to persist API keys or perform the OAuth process?
- Defining data models and normalization. You would need to make sure that the data you receive from API is saved in a structured way.
- Create a controller for API that keeps all the methods in one place, so you can easily modify and find all usages of the API across your codebase.
- Keeping up with updates. The APIs tend to change a lot: new methods come, old ones deprecate.

It was one of these days where I decided to connect to [Dev.to API](https://docs.dev.to/api/) to automatically collect stats for [my published articles](https://dev.to/ilyamkin). There wasn't any API client ready for use, so I ended up creating all of the wrapping logic around it. So if it's already there then why not share it with others together with my learnings, right? We'll go through five steps and come out with a clear plan on how to implement your own client.

## Step 1. Language and target platform

Before jumping into the coding part, let's discuss which language we're going to use. Remember my point about defining data models? For API client it's essential to give a user more information about data that is going be returned, so we don't have to constantly switch context between documentation and IDE. It also helps to avoid bugs and typos as you write code (we all have tests in the end, haven't we?). Keeping all that in mind, the best choice at the moment is to use Typescript.

Now let's think where our library is going to be run. Basically, it could a browser or a Node.js server. Why not develop a library that works in both? It'll also make it easier to use it together with server-side rendering where code executed at the server first and then on the client.

## Step 2. Bundling
Two major differentiators for any library is its size and support of users with old and modern clients. First, we want our size to be as small as possible - API client shouldn't add much weight to the project. Second, the library should have decent browser support by serving the CommonJS bundle for those who cannot support the modern version and at the same time give a modern bundle for clients with newer versions.

The default choice for a web project is [Webpack](https://webpack.js.org/), but our library is fairly small and simple, so I've chosen [Rollup](https://rollupjs.org/guide/en/) as base bundler together with [`microbundle`](https://github.com/developit/microbundle) for easy setup.

```bash
npm i -D microbundle
```

Now update the `package.js` with build tasks and a path to entry point:

```json
{
  "source": "src/foo.js",          // Your source file (same as 1st arg to microbundle)
  "main": "dist/foo.js",           // output path for CommonJS/Node
  "module": "dist/foo.module.js",  // output path for JS Modules
  "unpkg": "dist/foo.umd.js",      // optional, for unpkg.com
  "scripts": {
    "build": "microbundle",        // uses "source" and "main" as input and output paths by default
    "dev": "microbundle watch"
  }
}
```

## Step 3. Structure of the library

As we indent to support a lot of API endpoints we want our code to scale well if API expands. One of the best ways to do that is to align folders with resource names. For [Dev.to API](https://docs.dev.to/api/) it would look like this:

```
/src
	/articles
		index.ts // Everything that's related to articles
		...
	/comments
		index.ts
		...
	/users
		...
	index.ts // Imports and joins all resources together
```

It also useful to keep resources as separate classes, so you don't need to change root `index.ts` every time you add a new method. Then you'd need to merge them together using [Typescript Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html).

```js
function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        Object.defineProperty(
          derivedCtor.prototype,
          name,
          Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
        );
      });
    });
}
class DevTo extends Base {}
interface DevTo extends Articles, Comments, Users {}
applyMixins(DevTo, [Articles, Comments, Users])
export default DevTo
```

## Step 4. Fetching library

We wanted to make a library that works both in the browser and in Node.js. How we would make our requests universal as well? `fetch` is available in the browser but missing in Node.js where you should use the `http` module.
[`isomorphic-unfetch`](https://github.com/developit/unfetch/tree/master/packages/isomorphic-unfetch) will help us use fetch function everywhere and switch between browser and Node.js versions automatically.

Now let's have a look at the `request` function which wraps fetch and append authentication header:

```ts
request<T> (endpoint: string, options?: RequestInit): Promise<T> {
    const url = this.basePath + endpoint
    const headers = {
        'api-key': this.apiKey,
        'Content-type': 'application/json'
    }
    const config = {
        ...options,
        headers,
    }
    return fetch(url, config).then(r => {
        if (r.ok) {
            return r.json()
        }
        throw new Error(r.statusText)
    })
}
```

We always return `Promise`, so clients can chain requests together or wait for the results.

## Step 5. Testing

Most of the code in API client is integration with third-party endpoints. To make testing easier we can utilize the [Nock](https://github.com/nock/nock) library that conveniently mocks HTTP server for us.

```js
describe('Article resource', () => {
    test('getArticles returns a list of articles', async () => {
        // Set up the mock request
        const scope = nock('https://dev.to/api/')
           .get('/articles')
           .reply(200, [{ title: 'Article' }])

        // Make the request
        const DevToClient = new DevTo({ apiKey: 'XYZ' })
        await DevToClient.getArticles()

        // Assert that the expected request was made.
        scope.done()
    })
})
```

In the example above we set up the mock, then make the request and finally checking that mock has been executed.

## Conclusion

Together we designed an API client that is small, scalable, supports Typescript out-of-the-box, and works in browser and in Node.js.


I invite everyone to check out the [repository](https://github.com/ilyamkin/dev-to-js) to collaborate and improve the library. If you ever wanted to be a maintainer of an open-source library, this is something I'd be open to help.
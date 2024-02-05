# react-swift

> Made with create-react-library

[![NPM](https://img.shields.io/npm/v/react-swift.svg)](https://www.npmjs.com/package/react-swift) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-swift
```

## Usage

```tsx
import React, { Component } from 'react'

import MyComponent from 'react-swift'
import 'react-swift/dist/index.css'

class Example extends Component {
  render() {
    return <MyComponent />
  }
}
```

## Building

To build this package you will need to use nodejs v14. I recommend using [nvm](https://github.com/nvm-sh/nvm) or [micromamba](https://mamba.readthedocs.io/en/latest/user_guide/micromamba.html#micromamba) to manage installed versions.

With nodejs (v14.*) and npm (v6.*), run,

```sh
npm install
npm run build
```

This will output the build package to the `./dist/` folder.

## License

MIT © [jhavl](https://github.com/jhavl)

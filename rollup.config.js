import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import replace from "@rollup/plugin-replace"
import pkg from "./package.json"

const config = {
    input: "lib/index.js",
}

const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
]

const pureClass = {
    transform(code) {
        // Replace TS emitted @class function annotations with PURE so terser
        // can remove them
        return code.replace(/\/\*\* @class \*\//g, "/*@__PURE__*/")
    },
}

const umd = Object.assign({}, config, {
    output: {
        file: `dist/${pkg.name}.dev.js`,
        format: "umd",
        name: "Motion",
        exports: "named",
        globals: { react: "React" },
    },
    external: ["react", "react-dom"],
    plugins: [
        resolve(),
        replace({
            "process.env.NODE_ENV": JSON.stringify("development"),
        }),
    ],
})

const umdProd = Object.assign({}, umd, {
    output: Object.assign({}, umd.output, {
        file: `dist/${pkg.name}.js`,
    }),
    plugins: [
        resolve(),
        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
        }),
        pureClass,
        terser({ output: { comments: false } }),
    ],
})

const cjs = Object.assign({}, config, {
    output: {
        file: `dist/${pkg.name}.cjs.js`,
        format: "cjs",
        exports: "named",
    },
    plugins: [resolve()],
    external,
})

const es = Object.assign({}, config, {
    output: {
        format: "es",
        exports: "named",
        preserveModules: true,
        dir: "dist/es",
    },
    plugins: [resolve()],
    external,
})

const m = Object.assign({}, es, {
    input: "lib/render/dom/motion-minimal.js",
    output: Object.assign({}, es.output, {
        file: `dist/size-rollup-m.js`,
        preserveModules: false,
        dir: undefined,
    }),
    plugins: [resolve(), terser({ output: { comments: false } })],
})

const domAnimation = Object.assign({}, es, {
    input: "lib/render/dom/features-animation.js",
    output: Object.assign({}, es.output, {
        file: `dist/size-rollup-dom-animation.js`,
        preserveModules: false,
        dir: undefined,
    }),
    plugins: [resolve(), terser({ output: { comments: false } })],
})

const domMax = Object.assign({}, es, {
    input: "lib/render/dom/features-max.js",
    output: Object.assign({}, es.output, {
        file: `dist/size-rollup-dom-max.js`,
        preserveModules: false,
        dir: undefined,
    }),
    plugins: [resolve(), terser({ output: { comments: false } })],
})

export default [umd, umdProd, cjs, es, m, domAnimation, domMax]

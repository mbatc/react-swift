import React, { useMemo, useEffect, Suspense } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'

import { IShapeProps } from './SwiftComponents'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
// import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader'
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'

const defaultColor = 'hotpink'

const defaultCreateURLCallback = (url) => {
    return 'retrieve/' + url;
}

let createURLCallback = defaultCreateURLCallback;
let revokeURLCallback = (url) => {};

export function setCreateURLCallback(onFetch) {
    if (onFetch !== undefined) {
        createURLCallback = onFetch;
    } else {
        createURLCallback = defaultCreateURLCallback;
    }
}

export function setRevokeURLCallback(onRevoke) {
    if (onRevoke !== undefined) {
        revokeURLCallback = onRevoke;
    } else {
        revokeURLCallback = (url) => {};
    }
}

export interface IMeshShapeProps extends IShapeProps {
    url: string
}

const traverseChildren = (child, opacity, shadow) => {
    if (child.isMesh) {
        if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
                mat = mat.clone()
            })
        } else {
            child.material = child.material.clone()
        }

        if (shadow) {
            child.castShadow = true
            child.receiveShadow = true
        }

        if (opacity !== 1.0) {
            if (child.material.isMaterial) {
                child.material.transparent = true
                child.material.opacity = opacity
            } else if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                    mat.transparent = true
                    mat.opacity = opacity
                })
            }
        }
    } else if (child.type === 'PointLight') {
        child.visible = false
    } else if (child.isObject3D || child.isGroup) {
        child.children.forEach((child2) => {
            traverseChildren(child2, opacity, shadow)
        })
    }
}

const STLAsset = (props: IMeshShapeProps): JSX.Element => {
    const model = useLoader(STLLoader, props.url)
    const scene = useMemo(() => model.clone(), [model])

    // console.log('Loading: ')
    // console.log(props)

    // useEffect(() => {
    //     // scene.children.forEach((child) => {
    //     //     traverseChildren(child, props.opacity, true)
    //     // })
    //     scene.name = 'loaded'
    // })

    return (
        <mesh
            position={[props.t[0], props.t[1], props.t[2]]}
            quaternion={[props.q[0], props.q[1], props.q[2], props.q[3]]}
            scale={[props.scale[0], props.scale[1], props.scale[2]]}
            castShadow={true}
            receiveShadow={true}
            name={'loaded'}
        >
            <primitive object={scene} attach='geometry' />
            <meshStandardMaterial
                color={props.color ? props.color : defaultColor}
                transparent={props.opacity !== 1.0 ? true : false}
                opacity={props.opacity ? props.opacity : 1.0}
            />
        </mesh>
    )
}

const GLTFAsset = (props: IMeshShapeProps): JSX.Element => {
    const model = useLoader(GLTFLoader, props.url)

    useEffect(() => {
        model.scene.children.forEach((child) => {
            traverseChildren(child, props.opacity, true)
        })
    })

    return (
        <mesh
            position={[props.t[0], props.t[1], props.t[2]]}
            quaternion={[props.q[0], props.q[1], props.q[2], props.q[3]]}
            scale={[props.scale[0], props.scale[1], props.scale[2]]}
            castShadow={true}
            receiveShadow={true}
        >
            <primitive
                object={model.scene}
                opacity={props.opacity}
                castShadow={true}
                receiveShadow={true}
            />
        </mesh>
    )
}

const ColladaAsset = (props: IMeshShapeProps): JSX.Element => {
    const model = useLoader(ColladaLoader, props.url)
    const scene = useMemo(() => model.scene.clone(true), [model.scene])

    useEffect(() => {
        scene.children.forEach((child) => {
            traverseChildren(child, props.opacity, true)
        })
        scene.name = 'loaded'
    }, [scene])

    return (
        <primitive
            object={scene}
            position={props.t}
            scale={props.scale}
            quaternion={props.q}
        />
    )
}

const OBJAsset = (props: IMeshShapeProps): JSX.Element => {
    const mtlurl = props.url.slice(0, props.url.length - 3) + 'mtl'
    const materials = useLoader(MTLLoader, mtlurl)
    const model = useLoader(OBJLoader, props.url, (loader: MTLLoader) => {
        materials.preload()
        // loader.setMaterials(materials)
    })

    useEffect(() => {
        model.children.forEach((child) => {
            traverseChildren(child, props.opacity, true)
        })
    })

    return (
        <mesh
            position={[props.t[0], props.t[1], props.t[2]]}
            quaternion={[props.q[0], props.q[1], props.q[2], props.q[3]]}
            scale={[props.scale[0], props.scale[1], props.scale[2]]}
            castShadow={true}
            receiveShadow={true}
        >
            <primitive object={model} />
        </mesh>
    )
}

// const VRMLAsset = (props: IMeshShapeProps): JSX.Element => {
//     const model = useLoader(VRMLLoader, props.url)

//     useEffect(() => {
//         model.children.forEach((child) => {
//             traverseChildren(child, props.opacity, true)
//         })
//     })

//     return (
//         <mesh
//             position={[props.t[0], props.t[1], props.t[2]]}
//             quaternion={[props.q[0], props.q[1], props.q[2], props.q[3]]}
//             scale={[props.scale[0], props.scale[1], props.scale[2]]}
//             castShadow={true}
//             receiveShadow={true}
//         >
//             <primitive object={model} />
//         </mesh>
//     )
// }

const PCDAsset = (props: IMeshShapeProps): JSX.Element => {
    const model = useLoader(PCDLoader, props.url)

    useEffect(() => {
        // model.material.color = props.color
        //     ? new THREE.Color(props.color)
        //     : new THREE.Color(defaultColor)
        // model.material.transparent = props.opacity !== 1.0 ? true : false
        // model.material.opacity = props.opacity ? props.opacity : 1.0
    })

    return (
        <mesh
            position={[props.t[0], props.t[1], props.t[2]]}
            quaternion={[props.q[0], props.q[1], props.q[2], props.q[3]]}
            scale={[props.scale[0], props.scale[1], props.scale[2]]}
            castShadow={true}
            receiveShadow={true}
        >
            <primitive object={model} />
        </mesh>
    )
}

const PLYAsset = (props: IMeshShapeProps): JSX.Element => {
    const model = useLoader(PLYLoader, props.url)

    return (
        <mesh
            position={[props.t[0], props.t[1], props.t[2]]}
            quaternion={[props.q[0], props.q[1], props.q[2], props.q[3]]}
            scale={[props.scale[0], props.scale[1], props.scale[2]]}
            castShadow={true}
            receiveShadow={true}
        >
            <primitive object={model} attach='geometry' />
            <meshStandardMaterial
                color={props.color ? props.color : defaultColor}
                transparent={props.opacity !== 1.0 ? true : false}
                opacity={props.opacity ? props.opacity : 1.0}
            />
        </mesh>
    )
}

const FBXAsset = (props: IMeshShapeProps): JSX.Element => {
    const model = useLoader(FBXLoader, props.url)

    useEffect(() => {
        model.children.forEach((child) => {
            traverseChildren(child, props.opacity, true)
        })
    })

    return (
        <mesh
            position={[props.t[0], props.t[1], props.t[2]]}
            quaternion={[props.q[0], props.q[1], props.q[2], props.q[3]]}
            scale={[props.scale[0], props.scale[1], props.scale[2]]}
            castShadow={true}
            receiveShadow={true}
        >
            <primitive object={model} />
        </mesh>
    )
}

const SVGShape = ({ shape, color, index, opacity }) => (
    <mesh>
        <meshLambertMaterial
            attach='material'
            color={color}
            polygonOffset
            polygonOffsetFactor={index * -0.1}
            transparent={opacity !== 1.0 ? true : false}
            opacity={opacity ? opacity : 1.0}
        />
        <shapeBufferGeometry attach='geometry' args={[shape]} />
    </mesh>
)

const SVGAsset = React.memo((props: IMeshShapeProps): JSX.Element => {
    const { paths } = useLoader(SVGLoader, props.url)
    const shapes = useMemo(
        () =>
            paths.flatMap((path, index) =>
                path
                    .toShapes(true)
                    .map((shape) => ({ index, shape, color: path.color }))
            ),
        [paths]
    )
    return (
        <group
            children={shapes.map((newProps, key) => (
                <SVGShape key={key} opacity={props.opacity} {...newProps} />
            ))}
            scale={[
                -0.01 * props.scale[0],
                0.01 * props.scale[1],
                0.01 * props.scale[2],
            ]}
            position={[props.t[0], props.t[1], props.t[2]]}
            quaternion={[props.q[0], props.q[1], props.q[2], props.q[3]]}
        />
    )
})

const Loader = (props: IShapeProps): JSX.Element => {
    const ext = props.filename.split('.').pop().toLowerCase()

    const url = createURLCallback(props.filename)

    switch (ext) {
        case 'stl':
            return <STLAsset url={url} {...props}  />
            break

        case 'gltf':
        case 'glb':
            return <GLTFAsset url={url} {...props} />
            break

        case 'dae':
            return <ColladaAsset url={url} {...props} />
            break

        case 'obj':
            return <OBJAsset url={url} {...props} />
            break

        // case 'wrl':
        //     return <VRMLAsset url={url} {...props} />
        //     break

        case 'pcd':
            return <PCDAsset url={url} {...props} />
            break

        case 'ply':
            return <PLYAsset url={url} {...props} />
            break

        case 'fbx':
            return <FBXAsset url={url} {...props} />
            break

        case 'svg':
            return <SVGAsset url={url} {...props} />
            break

        default:
            return <ColladaAsset url={url} {...props} />
    }
}

export default Loader

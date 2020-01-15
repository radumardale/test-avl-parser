import {
  add,
  adjust,
  concat,
  curry,
  drop,
  equals,
  fromPairs,
  identity,
  ifElse,
  insert,
  join,
  last,
  lensProp,
  map,
  match,
  multiply,
  pipe,
  prop,
  repeat,
  replace,
  set,
  take,
  takeLast,
  toPairs,
} from "ramda"

// hexToInt :: String -> Number
export const hexToInt = hexString => parseInt(hexString, 16)

// hexToBin :: String -> String
export const hexToBin = hexSting => (hexToInt(hexSting) >>> 0).toString(2)

// binToInt :: String -> Number
export const binToInt = binValue => parseInt(binValue, 2)

// renameKeysBy :: func, Object -> Object
export const renameKeysBy = curry((fn, obj) =>
  pipe(toPairs, map(adjust(fn, 0)), fromPairs)(obj)
)

// moveHeadingBytesToProp :: Number, String, function
// -> [String, Object]
// -> [String, Object]
export const moveHeadingBytesToProp = (n, propName, transform = identity) => ([
  avl,
  acc = {},
]) => [
  drop(2 * n, avl),
  set(lensProp(propName), transform(take(2 * n, avl)), acc),
]

// pushHeadingBytesToArrayProp :: Number, String, function
// -> [String, Object]
// -> [String, Object]
export const pushHeadingBytesToArrayProp = (
  n,
  propName,
  transform = identity
) => ([avl, acc = {}]) => [
  drop(2 * n, avl),
  set(lensProp(propName), transform(take(2 * n, avl)), acc),
]

// repeatByAccPropertyValue :: String, String, [function]
// -> [String, Object]
// -> [String, Object]
export const repeatByAccPropertyValue = (
  propNameRepeatBy,
  propNameResult,
  funcs
) => ([avl, acc = {}]) => {
  const count = prop(propNameRepeatBy, acc)
  if (count == 0) {
    return [avl, acc]
  }
  const allFuncs = repeat(([avl, grandAcc]) => {
    const newObj = pipe(...funcs)([avl])
    return [
      newObj[0],
      set(
        lensProp(propNameResult),
        insert(0, newObj[1], prop(propNameResult, grandAcc) || []),
        grandAcc
      ),
    ]
  }, count)
  const response = pipe(...allFuncs)([avl, acc])
  return response
}

// getIo :: Number -> [String, Object] -> [String, Object]
export const getIo = size => ([avl, acc = {}]) => [
  drop(2 * (size + 1), avl),
  set(
    lensProp(take(2, avl)),
    takeLast(2 * size, take(2 * (size + 1), avl)),
    acc
  ),
]

// leftPad :: String, Number -> String
export const leftPad = (c, length) =>
  pipe(concat(join("", repeat(c, length))), takeLast(length))

// transformLatLng :: String -> Float
export const transformLatLng = pipe(
  hexToBin,
  leftPad("0", 32),
  ifElse(
    val => equals(1, hexToInt(take(1, val))),
    pipe(
      replace(/0/g, "x"),
      replace(/1/g, "0"),
      replace(/x/g, "1"),
      add(1),
      binToInt
    ),
    binToInt
  ),
  multiply(0.0000001)
)

// parseImei :: String -> String
export const parseImei = pipe(match(/.{2}/g), map(last), join(""))

// export default {
//   hexToBin,
//   hexToInt,
//   binToInt,
//   renameKeysBy,
//   transformLatLng,
//   parseImei,
//   moveHeadingBytesToProp,
//   pushHeadingBytesToArrayProp,
//   repeatByAccPropertyValue,
//   getIo,
//   leftPad,
// }

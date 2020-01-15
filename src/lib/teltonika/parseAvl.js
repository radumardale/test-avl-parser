import {
  add,
  adjust,
  concat,
  curry,
  divide,
  drop,
  equals,
  evolve,
  flip,
  fromPairs,
  identity,
  tap,
  ifElse,
  insert,
  join,
  last,
  lensProp,
  map,
  match,
  mergeAll,
  multiply,
  pipe,
  prop,
  repeat,
  replace,
  set,
  take,
  takeLast,
  toPairs,
  unapply,
} from "ramda"

// list :: arg1, arg2, ... -> [arg1, arg2, ...]
export const list = unapply(identity)

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

// // pipeObjectInPropArray :: String, [functions]
// // -> [String, Object]
// // -> [String, Object]
// export const pipeObjectInPropArray = (propName, funcs) => ([avl, acc = {}]) => {
//   export const newRecord = pipe(...funcs)([avl]);
//   return [
//     newRecord[0],
//     set(lensProp(propName), insert(0, newRecord[1], prop(propName, acc) || []), acc)
//   ]
// };

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

export const getRecordFunctions = [
  moveHeadingBytesToProp(8, "timestamp"),
  moveHeadingBytesToProp(1, "priority"),
  moveHeadingBytesToProp(4, "latitude"),
  moveHeadingBytesToProp(4, "longitude"),
  moveHeadingBytesToProp(2, "altitude"),
  moveHeadingBytesToProp(2, "angle"),
  moveHeadingBytesToProp(1, "satellites"),
  moveHeadingBytesToProp(2, "speed"),

  moveHeadingBytesToProp(1, "eventIoId"),
  moveHeadingBytesToProp(1, "totalIoEvents", hexToInt),

  moveHeadingBytesToProp(1, "total1ByteEvents", hexToInt),
  repeatByAccPropertyValue("total1ByteEvents", "ios", [getIo(1)]),

  moveHeadingBytesToProp(1, "total2ByteEvents", hexToInt),
  repeatByAccPropertyValue("total2ByteEvents", "ios", [getIo(2)]),

  moveHeadingBytesToProp(1, "total4ByteEvents", hexToInt),
  repeatByAccPropertyValue("total4ByteEvents", "ios", [getIo(4)]),

  moveHeadingBytesToProp(1, "total8ByteEvents", hexToInt),
  repeatByAccPropertyValue("total8ByteEvents", "ios", [getIo(8)]),
]

export const TELTONIKA_IOS_EVOLVE = {
  "1": hexToInt, // ignition
  "181": hexToInt, // GPS PDOP
  "182": hexToInt, // GPS HDOP
  "66": hexToInt, // external voltage
  "240": hexToInt, // movement
  "199": hexToInt, // trip distance
  "241": hexToInt, // active gps operator
  "24": hexToInt, // gps speed
  "80": hexToInt, // data mode
  "21": hexToInt, // gsm signal
  "200": hexToInt, // deep sleep
  "205": hexToInt, // gsm cell id
  "206": hexToInt, // gsm area code
  "67": hexToInt, // battery voltage
  "68": hexToInt, // battery current
  "16": hexToInt, // total distance km
  "253": hexToInt, // green drivingType
  "252": hexToInt, // unplug detection
  "247": hexToInt, // crash detection
  "248": hexToInt, // alarm
  "246": hexToInt, // towing detection
  "254": hexToInt, // green driving value
  "249": hexToInt, // jamming

  "90": hexToInt, // Number of DTC
  "91": hexToInt, // Calculated engine load value
  "5": hexToInt, // Engine coolant temperature
  "92": hexToInt, // Short term fuel trim 1
  "93": hexToInt, // Fuel pressure
  "94": hexToInt, // Intake manifold absolute pressure
  "6": hexToInt, // Engine RPM
  "8": hexToInt, // Vehicle speed
  "95": hexToInt, // Timing advance
  "96": hexToInt, // Intake air temperature
  "97": hexToInt, // MAF air flow rate
  "7": hexToInt, // Throttle position
  "98": hexToInt, // Run time since engine start
  "10": hexToInt, // Distance traveled MIL on
  "99": hexToInt, // Relative fuel rail pressure
  "100": hexToInt, // Direct fuel rail pressure
  "101": hexToInt, // Commanded EGR
  "102": hexToInt, // EGR error
  "9": hexToInt, // Fuel level
  "11": hexToInt, // Distance traveled since codes cleared
  "103": hexToInt, // Barometric pressure
  "104": hexToInt, // Control module voltage
}

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

export const parseUDPAvl = avl => {
  const workAvl = pipe(
    moveHeadingBytesToProp(2, "length", hexToInt),
    moveHeadingBytesToProp(2, "packageId"),
    moveHeadingBytesToProp(1, "packageType", hexToInt),
    // tap(x => console.log('in UDP', x)),
    moveHeadingBytesToProp(1, "avlId"),
    moveHeadingBytesToProp(2, "imeiLength", hexToInt),
    moveHeadingBytesToProp(15, "imei", parseImei),

    moveHeadingBytesToProp(1, "codec"),
    moveHeadingBytesToProp(1, "numberOfRecords", hexToInt),
    repeatByAccPropertyValue("numberOfRecords", "records", getRecordFunctions),
    ([checkCountPackagesStr, avlObj]) => {
      const checkCount = hexToInt(checkCountPackagesStr)
      if (checkCount == avlObj.records.length) {
        // console.log('package OK!', avlObj);
        // console.log('package OK!', avlObj.records);
      }
      return evolve(
        {
          records: map(
            evolve({
              timestamp: pipe(hexToInt, flip(divide)(1000)),
              priority: hexToInt,
              latitude: transformLatLng,
              longitude: transformLatLng,
              altitude: hexToInt,
              angle: hexToInt,
              satellites: hexToInt,
              speed: hexToInt,
              // ios: pipe(
              //   mergeAll,
              //   renameKeysBy(hexToInt),
              //   evolve(TELTONIKA_IOS_EVOLVE)
              // )
            })
          ),
        },
        avlObj
      )
    }
  )

  return workAvl([avl])
}

// export const longSS = '08050000015B45A87680000F463DF51B37E225023B00001500000006020101F0000443244F44000042333118000000000000015B45AA4B40000F463D4A1B37E25F023900001200000006020101F0000443244E44000042332F18000000000000015B45AC2000000F463DEE1B37E22B023A00001200000006020101F0000443244C44000042333218000000000000015B45ADF4C0000F463D691B37E212023A00001300000006020101F0000443244C44000042332E18000000000000015B45AFC980000F463DA71B37E228023A00001200000006020101F0000443244A440000423332180000000005';
// export const ss = '08010000015B45B00030000EA0F0EA1AD4935001E000331200270007020101F0010309001F426E1D18002502530046CC1F59000000400001';

// export const ss = '004DCAFE011A000F33353734353430373230383637373808010000015B45B01F70000F97C2F11A830A350054002113002F0007020101F0010309001C426FCE18002E02530017B14B59000000160001';
// export const rr = parseUDPAvl(ss);

// // console.log(rr);
// console.log(JSON.stringify(rr, ' ', 2));

// module.exports = parseUDPAvl;

// module.exports = parseUDPAvl;

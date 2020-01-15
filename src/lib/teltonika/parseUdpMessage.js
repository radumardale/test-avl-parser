import {
  moveHeadingBytesToProp,
  repeatByAccPropertyValue,
  getIo,
  hexToInt,
  renameKeysBy,
  transformLatLng,
} from "../helpers"

import { evolve, flip, map, divide, mergeAll, pipe } from "ramda"

const getRecordFunctions = [
  moveHeadingBytesToProp(8, "timestamp"),
  moveHeadingBytesToProp(1, "priority"),
  moveHeadingBytesToProp(4, "longitude"),
  moveHeadingBytesToProp(4, "latitude"),
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

const TELTONIKA_IOS_EVOLVE = {
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

const parseAvl = avl => {
  return pipe(
    moveHeadingBytesToProp(4, "empty"),
    moveHeadingBytesToProp(4, "packageTotalLength"),
    moveHeadingBytesToProp(1, "codec"),
    moveHeadingBytesToProp(1, "numberOfRecords", hexToInt),
    repeatByAccPropertyValue("numberOfRecords", "records", getRecordFunctions),
    ([checkCountPackagesStr, avlObj]) => {
      const checkCount = hexToInt(checkCountPackagesStr)
      if (checkCount == avlObj.records.length) {
        logger.info(`package OK! ${avlObj.records.length} records`)
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
              ios: pipe(
                mergeAll,
                renameKeysBy(hexToInt),
                evolve(TELTONIKA_IOS_EVOLVE)
              ),
            })
          ),
        },
        avlObj
      )
    }
  )([avl])
}

module.exports = parseAvl

import React from "react"
// import { Link } from "gatsby"
// import parseAvl from "../lib/teltonika/parseAvl"
import { parseUDPAvl } from "../lib/teltonika/parseAvl"
import "./index.css"

import Layout from "../components/layout"
// import Image from "../components/image"
import SEO from "../components/seo"

import { toPairs } from "ramda"

const IndexPage = () => {
  const [avl, setAvl] = React.useState(
    "00FECAFE01CE000F33353633303730343637303837313408050000015B45A87680000F463DF51B37E225023B00001500000006020101F0000443244F44000042333118000000000000015B45AA4B40000F463D4A1B37E25F023900001200000006020101F0000443244E44000042332F18000000000000015B45AC2000000F463DEE1B37E22B023A00001200000006020101F0000443244C44000042333218000000000000015B45ADF4C0000F463D691B37E212023A00001300000006020101F0000443244C44000042332E18000000000000015B45AFC980000F463DA71B37E228023A00001200000006020101F0000443244A440000423332180000000005"
    // "006ACAFE01EA000F33353230393430383935353030353408010000016AA4EC7CB8000F4AD2BA1B2F25CC028C00EC120042FD11070101EF01514152385948FD03FE1A060900205400005505146E00007300005A0000045300246DA0572D6C0E4464000000DB6B000000000001"
  )
  const [result, setResult] = React.useState()
  return (
    <Layout>
      <SEO title="Home" />
      <div className="card padding-1">
        <label>
          AVL-MESSAGE
          <textarea
            placeholder="paste your avl here"
            rows="8"
            value={avl}
            onChange={e => setAvl(e.target.value)}
          />
        </label>
        <button
          className="button primary"
          onClick={() => {
            setResult(parseUDPAvl(avl))
          }}
        >
          Parse
        </button>
      </div>
      {result && (
        <div className="card padding-1">
          <table className="stack hover">
            <tbody>
              {result &&
                toPairs(result)
                  .filter(([key]) => key !== "records")
                  .map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value}</td>
                    </tr>
                  ))}

              {result && (
                <tr>
                  <td>records</td>
                  <td>{result.records.length}</td>
                </tr>
              )}

              {result.records &&
                result.records.map((record, index) => (
                  <tr key={`record=${index}`}>
                    <td
                      style={{ verticalAlign: "top" }}
                      className="padding-top-2"
                    >
                      Record {index}
                      <hr />
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${record.longitude},${record.latitude}`}
                        target="_blank"
                      >
                        Show in Google Maps
                      </a>
                    </td>
                    <td>
                      <table className="record-table">
                        <tbody>
                          {toPairs(record)
                            .filter(
                              ([key, value]) =>
                                typeof value === "string" ||
                                typeof value === "number"
                            )
                            .map(([key, value]) => {
                              let label
                              if (key === "timestamp") {
                                const dateObj = new Date(value * 1000)
                                label = (
                                  <span className="margin-left-1">
                                    {dateObj.toISOString()}
                                  </span>
                                )
                              }
                              return (
                                <tr key={key}>
                                  <td>{key}</td>
                                  <td>
                                    {value}
                                    {key === "timestamp" && label}
                                  </td>
                                </tr>
                              )
                            })}

                          <tr>
                            <td>I/O</td>
                            <td>
                              <table>
                                <thead>
                                  <tr>
                                    <th>I/O hex</th>
                                    <th>Raw value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {record.ios.map((que, ioIndex) => {
                                    const [[ioKey, ioValue]] = toPairs(que)
                                    return (
                                      <tr key={`io-${index}-${ioIndex}`}>
                                        <td>{ioKey}</td>
                                        <td>{ioValue}</td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}

export default IndexPage

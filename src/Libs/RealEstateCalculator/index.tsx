/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import Papa from 'papaparse'
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts'

type Property = {
  price: number
  beds: number
  baths: number
  zipCode: string
  squareFeet: number
  lotSize: number
  pricePerSquareFoot: number
  daysOnMarket?: number
  yearBuilt?: number
}

const RealEstateCalculator = () => {
  const [data, setData] = useState<Property[]>([])
  const [filters, setFilters] = useState({ bedrooms: '', zipCode: '' })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          console.log(result)
          result.data.shift()
          result.data.filter((result: any) => !result.PRICE || !result['SQUARE FEET'])
          result.data = result.data.sort((a: any, b: any) => {
            const ratioA = a.PRICE / a['SQUARE FEET']
            const ratioB = b.PRICE / b['SQUARE FEET']

            // Sort in ascending order (lower price per square foot first)
            return ratioA - ratioB
          })
          setData(
            result.data.map((row: any) => ({
              price: parseFloat(row.PRICE) || 0,
              beds: parseInt(row.BEDS) || 0,
              baths: parseFloat(row.BATHS) || 0,
              zipCode: row['ZIP OR POSTAL CODE'] || '',
              squareFeet: parseFloat(row['SQUARE FEET']) || 0,
              lotSize: parseFloat(row['LOT SIZE']) || 0,
              pricePerSquareFoot: parseFloat(row['$/SQUARE FEET']) || 0,
              daysOnMarket: row['DAYS ON MARKET'] ? parseInt(row['DAYS ON MARKET']) : undefined,
              yearBuilt: row['YEAR BUILT'] ? parseInt(row['YEAR BUILT']) : undefined,
            }))
          )
        },
      })
    }
  }

  const applyFilters = () => {
    let filteredData = data
    if (filters.bedrooms) {
      filteredData = filteredData.filter((item) => item.beds === parseInt(filters.bedrooms))
    }
    if (filters.zipCode) {
      filteredData = filteredData.filter((item) => item.zipCode === filters.zipCode)
    }
    return filteredData
  }

  const calculateStatistics = (filteredData: Property[]) => {
    const prices = filteredData.map((item) => item.price)
    const pricePerSquareFoot = filteredData.map((item) => item.pricePerSquareFoot)

    const averagePrice = (prices.reduce((acc, val) => acc + val, 0) / prices.length || 0).toFixed(2)
    const medianPrice = (
      prices.length > 0 ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : 0
    ).toFixed(2)

    const averagePricePerSqFt = (
      pricePerSquareFoot.reduce((acc, val) => acc + val, 0) / pricePerSquareFoot.length || 0
    ).toFixed(2)

    return {
      averagePrice,
      medianPrice,
      averagePricePerSqFt,
    }
  }

  const filteredData = applyFilters()
  const stats = calculateStatistics(filteredData)

  return (
    <div>
      <h2>Real Estate Calculator</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      <div>
        <label>Filter by Bedrooms: </label>
        <input
          type="number"
          value={filters.bedrooms}
          onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
        />
        <label>Filter by ZIP Code: </label>
        <input
          type="text"
          value={filters.zipCode}
          onChange={(e) => setFilters({ ...filters, zipCode: e.target.value })}
        />
      </div>

      <div>
        <h3>Statistics</h3>
        <p>Average Price: ${stats.averagePrice}</p>
        <p>Median Price: ${stats.medianPrice}</p>
        <p>Average Price per Square Foot: ${stats.averagePricePerSqFt}</p>
      </div>

      <h3>Price Distribution (Bar Chart)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="squareFeet"
            name="Square Feet"
            type="number"
            domain={[0, 'dataMax']}
            tickCount={8}
            ticks={[0, 500, 1000, 1500, 2000, 2500, 3000]}
          />
          <YAxis dataKey="price" name="Price" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="Price vs Square Feet" data={filteredData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RealEstateCalculator

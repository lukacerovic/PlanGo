const toRad = (degree) => (degree * Math.PI) / 180


// a = sin^2(Δφ / 2) + cos(φ1) * cos(φ2) * sin^2(Δλ / 2)
// c = 2 * atan2(√a, √(1 - a))
// d = R * c

// φ1, φ2 — geografske širine prve i druge tačke (u radijanima)
// λ1, λ2 — geografske dužine prve i druge tačke (u radijanima)
// Δφ = φ2 - φ1 — razlika širina
// Δλ = λ2 - λ1 — razlika dužina
// R — poluprečnik Zemlje (najčešće => 6371 km)
// d — udaljenost između dve tačke na površini Zemlje u kilometrima.

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const calculateBestRoute = (markers, originPoint) => {
  const coordinates = markers.map((marker) => {
    return { latitude: marker.latitude, longitude: marker.longitude }
  })

  const origin = { latitude: originPoint.latitude, longitude: originPoint.longitude }
  coordinates.unshift(origin)

  const n = coordinates.length
  const distances = coordinates.map((point1, index1) =>
    coordinates.map((point2, index2) =>
      haversineDistance(point1.latitude, point1.longitude, point2.latitude, point2.longitude)
    )
  )

  const bestRoute = []
  const visited = Array(n).fill(false)
  let currentIndex = 0 
  visited[currentIndex] = true
  bestRoute.push({ ...coordinates[currentIndex], pointOrder: 0 })

  for (let i = 1; i < n; i++) {
    let nearestDistance = Infinity
    let nearestIndex = -1
    
    for (let j = 0; j < n; j++) {
      if (!visited[j] && distances[currentIndex][j] < nearestDistance) {
        nearestDistance = distances[currentIndex][j]
        nearestIndex = j
      }
    }
    
    visited[nearestIndex] = true
    currentIndex = nearestIndex
    bestRoute.push({ ...coordinates[currentIndex], pointOrder: i })
  }

  bestRoute.push({ ...coordinates[0], pointOrder: n }) 

  return bestRoute 
}








// Brute Force approach

// const toRad = (degree) => (degree * Math.PI) / 180

// const haversineDistance = (lat1, lon1, lat2, lon2) => {
//   const R = 6371 
//   const dLat = toRad(lat2 - lat1)
//   const dLon = toRad(lon2 - lon1)
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2)
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
//   return R * c 
// }

// export const calculateBestRoute = (markers) => {
//     const coordinates = markers.map((marker) => {
//         return {latitude: marker.latitude, longitude: marker.longitude}
//     })
//     console.log("coordinates: ", coordinates)
//     const distances = coordinates.map((point1, index1) => 
//       coordinates.map((point2, index2) => 
//         haversineDistance(point1.latitude, point1.longitude, point2.latitude, point2.longitude)
//       )
//     )
  
//     const n = coordinates.length
//     const visited = Array(n).fill(false)
//     let bestRoute = []
//     let bestDistance = Infinity
  
//     const findRoute = (route, lastIndex, totalDistance) => {
//       if (route.length === n) {
//         if (totalDistance < bestDistance) {
//           bestRoute = [...route]
//           bestDistance = totalDistance
//         }
//         return
//       }
  
//       for (let i = 0 i < n i++) {
//         if (!visited[i]) {
//           visited[i] = true
//           route.push(i)
//           findRoute(route, i, totalDistance + (route.length === 1 ? 0 : distances[lastIndex][i]))
//           route.pop()
//           visited[i] = false
//         }
//       }
//     }
  
//     for (let i = 0 i < n i++) {
//       visited[i] = true
//       findRoute([i], i, 0)
//       visited[i] = false
//     }
  
//     return bestRoute.map(index => coordinates[index])
//   }
  
import CategoryTags from './data/category-tags.json'
import CountriesWithEmoji from './data/countries-with-emoji.json'


function addObjectToArray(arr, obj, unshift=false, avoidDuplicates=true) {
  // look for duplicate
  let duplicateItemIndex = arr.findIndex(item => JSON.stringify(item) === JSON.stringify(obj))
  if (avoidDuplicates && duplicateItemIndex >= 0) {
    arr.splice(duplicateItemIndex, 1)
  }
  // add obj to array
  if (unshift) {
    arr.unshift(obj)
  } else {
    arr.push(obj)
  }
  return arr
}

function removeObjectFromArray(arr, obj) {
  let itemIndex = arr.findIndex(item => JSON.stringify(item) === JSON.stringify(obj))
  arr.splice(itemIndex, 1)
  return arr
}

/**
 * output: '2023-12-25'
 */
function currentDate() {
  return new Date().toISOString().substring(0, 10)
}

/**
 * output: '2023-12-25T00:00:00.000Z'
 */
function currentStartOfDay() {
  let today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return today.toISOString()
}

/**
 * input: '2023-12-25'
 * output: '12/25/2023'
 */
function prettyDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(navigator.language, {dateStyle: 'short'}).format(date)
}

/**
 * input: '2023-12-25T17:08:19.021410+01:00'
 * output: '12/25/2023, 8:19AM'
 */
function prettyDateTime(dateTimeString) {
  const date = new Date(dateTimeString)
  return new Intl.DateTimeFormat(navigator.language, {dateStyle: 'short', timeStyle: 'short'}).format(date)
}

/**
 * https://johnresig.com/blog/javascript-pretty-date/
 * input: '2023-12-25T17:08:19.021410+01:00'
 * output: '5 hours ago', 'Yesterday', '2 days ago'...
 * changes: add short (replace 'days' with 'd', remove 'Yesterday') & shortest (remove 'ago'), extend days & weeks
 */
function prettyRelativeDateTime(dateTimeString, size=null) {
  var date = new Date((dateTimeString || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
      diff = (((new Date()).getTime() - date.getTime()) / 1000),
      day_diff = Math.floor(diff / 86400);

  if (isNaN(day_diff) || day_diff < 0) return;

  if (size == 'shortest') {
    return day_diff == 0 && (
      diff < 60 && "just now" || diff < 120 && "1m" || diff < 3600 && Math.floor(diff / 60) + "m" || diff < 7200 && "1h" || diff < 86400 && Math.floor(diff / 3600) + "h") || day_diff < 10 && day_diff + "d" || Math.ceil(day_diff / 7) + "w";
  }
  if (size == 'short') {
    return day_diff == 0 && (
      diff < 60 && "just now" || diff < 120 && "1m ago" || diff < 3600 && Math.floor(diff / 60) + "m ago" || diff < 7200 && "1h ago" || diff < 86400 && Math.floor(diff / 3600) + "h ago") || day_diff < 10 && day_diff + "d ago" || Math.ceil(day_diff / 7) + "w ago";
  }
  return day_diff == 0 && (
  diff < 60 && "just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago") || day_diff == 1 && "Yesterday" || day_diff < 10 && day_diff + " days ago" || Math.ceil(day_diff / 7) + " weeks ago";
}

function getCategoryName(categoryId) {
  let category = CategoryTags.find(ct => ct.id === categoryId)
  return category ? category.name : categoryId
}

function getLocaleCategoryTags(locale) {
  return import(`./data/categories/${locale}.json`)
}

function getLocaleCategoryTagName(locale, categoryId) {
  return getLocaleCategoryTags(locale).then((module) => {
    let category = module.default.find(ct => ct.id === categoryId)
    return category ? category.name : categoryId
  })
}

function getLocaleOriginTags(locale) {
  return import(`./data/origins/${locale}.json`)
}

function getCountryEmojiFromName(countryString) {
  const country = CountriesWithEmoji.find(c => c.name === countryString || (c.name_original && c.name_original.length && c.name_original.indexOf(countryString) > -1))
  return country ? country.emoji : null
}

function getLocationName(locationObject) {
  // Photon
  if (locationObject.properties) {
    return locationObject.properties.name
  }
  // Nominatim or OP
  return locationObject.name || locationObject.osm_name
}

function getLocationRoad(locationObject) {
  // Nominatim
  if (locationObject.address) {
    let locationRoad = locationObject.address.house_number ? `${locationObject.address.house_number} ` : ''
    locationRoad += locationObject.address.road || ''
    return locationRoad
  }
  // Photon
  else if (locationObject.properties) {
    return locationObject.properties.street
  }
  // OP
  return ''
}

function getLocationCity(locationObject) {
  // Nominatim
  if (locationObject.address) {
    return locationObject.address.village || locationObject.address.town || locationObject.address.city || locationObject.address.municipality
  }
  // Photon
  else if (locationObject.properties) {
    return locationObject.properties.village || locationObject.properties.town || locationObject.properties.city || locationObject.properties.municipality
  }
  // OP
  return locationObject.osm_address_city || ''
}

function getLocationTitle(locationObject, withName=true, withRoad=false, withCity=true, withEmoji=false) {
  let locationTitle = ''
  if (withName) {
    locationTitle += `${getLocationName(locationObject)}`
  }
  if (withRoad && (locationObject.address || locationObject.properties)) {
    locationTitle += locationTitle ? ', ' : ''
    locationTitle += getLocationRoad(locationObject)
  }
  if (withCity) {
    locationTitle += locationTitle ? ', ' : ''
    locationTitle += getLocationCity(locationObject)
  }
  if (withEmoji) {
    locationTitle += ` ${getCountryEmojiFromName(locationObject.osm_address_country) || ''}`
  }
  return locationTitle
}

function getLocationID(locationObject) {
  // Photon
  if (locationObject.properties) {
    return locationObject.properties.osm_id
  }
  // Nominatim or OP
  return locationObject.osm_id
}

function getLocationType(locationObject) {
  if (locationObject.properties) {
    const OSM_TYPE_MAPPING = {"N": "Node", "W": "Way", "R": "Relation"}
    return OSM_TYPE_MAPPING[locationObject.properties.osm_type].toUpperCase()
  }
  // Nominatim or OP
  return locationObject.osm_type.toUpperCase()
}

function getLocationUniqueID(locationObject) {
  // examples: N12345
  return `${getLocationType(locationObject)[0]}${getLocationID(locationObject).toString()}`
}

function getLocationCategory(locationObject) {
  // examples: shop, amenity, building
  // Photon
  if (locationObject.properties) {
    return locationObject.properties.osm_key
  }
  // Nominatim or OP
  return locationObject.type || locationObject.osm_type
}

function getLocationLatLng(locationObject) {
  // Nominatim
  if (locationObject.lat && locationObject.lon) {
    return [locationObject.lat, locationObject.lon]
  }
  // Photon
  else if (locationObject.geometry && locationObject.geometry.coordinates) {
    return [locationObject.geometry.coordinates[1], locationObject.geometry.coordinates[0]]
  }
  return [locationObject.osm_lat, locationObject.osm_lon]
}

function getMapBounds(results, source='nominatim') {
  if (source === 'photon') {
    return results.map(l => [l.geometry.coordinates[1], l.geometry.coordinates[0]])
  }
  return results.map(l => [l.lat, l.lon])
}
function getMapCenter(results, source='nominatim') {
  if (source === 'photon') {
    return [results[0].geometry.coordinates[1], results[0].geometry.coordinates[0]]
  }
  return [results[0].lat, results[0][lon]]
}


export default {
  addObjectToArray,
  removeObjectFromArray,
  currentStartOfDay,
  currentDate,
  prettyDate,
  prettyDateTime,
  prettyRelativeDateTime,
  getCategoryName,
  getLocaleCategoryTags,
  getLocaleCategoryTagName,
  getLocaleOriginTags,
  getCountryEmojiFromName,
  getLocationTitle,
  getLocationID,
  getLocationType,
  getLocationUniqueID,
  getLocationCategory,
  getLocationLatLng,
  getMapBounds,
  getMapCenter,
}

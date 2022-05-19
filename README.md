# Utility functions for A.I. Datapipes.
## Uses Web version 9 (modular)


Completes daily routines.

[node firestore](https://firebase.google.com/docs/firestore/quickstart)
```
npm install firebase@9.8.1 --save
npm install mongoose
```

# MONGO Shell Helpful queries:

## Get Elements of an array
* Slices the objects within the 'zone12.lineRT' array and returns the sliced amount only

```
use datapipes

db.systems.aggregate( { $project: { _id : 0, timestamp: {$slice: ["$zone12.lineRT",2,2]}}})
```

 * Returns a count of total temperature readings inside the array
 ```
 use datapipes

 db.systems.aggregate( { $project: { _id : 0, numTimeStamps: {$size : "$zone11.lineRT"}}})
 ```


 * Filters contents of a nested array:
```
db.systems.aggregate([
     {
     $project: {
     _id: 0,
     numTimeStamps: { $filter: { input: '$zone10.lineRT', as: 'ts', cond: { $gt : ['$$ts.timeStamp', 1652213407876.097] }}}
     }
    }
  ])
```

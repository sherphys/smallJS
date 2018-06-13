Este es un proyecto pequeño para practicar JS

Problema:

Asignador de Citas para una EPS por 
medio de bases de datos Posgrest y MongoDB

#MODULOS PLANEADOS - Init
#DB-sql  --> Base de datos postgresql
#DB-nsql --> Base de datos mongodb

#npm init --> crear el package.json 
test personalizados (lint setup test)

modulo principal index.js

``` js

const setupDataBase=require(platziverse-db)
setupDatabase(config).then(db=> 
{
    const {Agent,Metric} = db
    //const Agent  = db.Agent
    //const Metric = db.Metric
}).catch(err=>console.error(err))

```

npm i --save-dev standart
lint : standart --fix
Y corremos npm run lint

Ahora vamos hacer el modulo de los modelos tanto para sql como para nsql

En el modulo sql creamos los modelos
models/user
models/scheduleuser
models/scheduleips






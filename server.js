const express = require('express');
var fs = require('fs');

const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
var server = require('http').Server(app);

var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json());
app.use(express.static('public'));

const pool = mysql.createPool({
    connectionLimit: 5,
    host: 'beawyfttye7qp6miq7d8-mysql.services.clever-cloud.com',
    user: 'uehvcsyfm5yqqcv1',
    password: 'SUvhNBezAqKw86i92JQc',
    database: 'beawyfttye7qp6miq7d8'
})


//FUNCIONES GET


// Petición principal
app.get('/', (req, response) => {
    var contenido = fs.readFileSync("public/index.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});


// Cursos
app.get('/cursos', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query('SELECT * FROM cursos', (err, rows) => {
            connection.release()

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

// Centros
app.get('/centros', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query('SELECT centros.id_centro, centros.nombre_centro, centros.direccion, centros.telefono, centros.id_curso_imp, cursos.nombre_curso FROM centros INNER JOIN cursos ON centros.id_centro = cursos.id_curso', (err, rows) => {
            connection.release()

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})


// Alumnos
app.get('/alumnos', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query('SELECT alumnos.id_alumno, alumnos.nombre, alumnos.apellido, alumnos.fecha_nacimiento, alumnos.id_curso, alumnos.notas, alumnos.aprobado, cursos.nombre_curso AS nombre_curso FROM alumnos INNER JOIN cursos ON alumnos.id_curso = cursos.id_curso WHERE alumnos.id_curso = 2', (err, rows) => {
            connection.release()

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})


// Gráficas
app.get('/graficas', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query('SELECT alumnos.aprobado, alumnos.id_curso, cursos.nombre_curso FROM alumnos INNER JOIN cursos ON alumnos.id_curso = cursos.id_curso;', (err, rows) => {
            connection.release()

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})


// Datos curso
app.post('/detallesCurso', (req, res) => {
    let courseId = req.body.id;
    courseId = parseInt(courseId);

    pool.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ error: 'Error al conectar con la base de datos' });
            return;
        }
        console.log(courseId);

        connection.query('SELECT * FROM cursos WHERE id_curso = ?', [courseId], (err, rows) => {
            connection.release();

            if (err) {
                res.status(500).json({ error: 'Error al obtener los detalles del curso' });
                return;
            }

            if (rows.length === 0) {
                res.status(404).json({ error: 'No se encontró ningún curso con el ID proporcionado' });
                return;
            }

            const curso = rows[0];
            res.status(200).json(curso);
        });
    });
});


// Actualizar curso 
app.put('/actualizarCurso', (req, res) => {
    const { nombre, descripcion, horas, id } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error al obtener la conexión:', err);
            res.status(500).json({ error: 'Error al conectar con la base de datos' });
            return;
        }

        connection.query('UPDATE cursos SET nombre_curso = ?, descripcion = ?, duracion_horas = ? WHERE id_curso = ?', [nombre, descripcion, horas, id], (err, rows) => {
            connection.release();

            if (err) {
                console.error('Error al ejecutar la consulta:', err);
                res.status(500).json({ error: 'Error al actualizar el curso en la base de datos' });
                return;
            }

            res.status(200).json({ message: `El curso con id ${id} ha sido actualizado.` });
        });
    });
});


// Borrar alumno
app.delete('/borrar/:id', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error al obtener una conexión del pool:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }

        connection.query('DELETE FROM alumnos WHERE id_alumno = ?', [req.params.id], (err, result) => {
            connection.release();

            if (err) {
                console.error('Error al eliminar el alumno: ', err);
                res.status(500).send('Error interno del servidor');
                return;
            }

            if (result.affectedRows > 0) {
                res.send(`Alumno con ID ${req.params.id} ha sido eliminado correctamente.`);
            } else {
                res.status(404).send(`No se encontró ningún alumno con ID ${req.params.id}.`);
            }
        });
    });
});


//FUNCION MAIN DEL SERVIDOR
server.listen(port, () => {
    console.log('App listening on port 3000');
});
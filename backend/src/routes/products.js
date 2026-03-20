const express = require('express');
const router = express.Router();
const db = require('../config/db');

const validateData = (data) => {
    const { campo1, campo2, campo3, campo4, campo5, campo6 } = data;
    if (typeof campo1 !== 'string' || !campo1.trim()) return false;
    if (typeof campo2 !== 'string' || !campo2.trim()) return false;
    if (typeof campo3 !== 'string' || !campo3.trim()) return false;
    if (!Number.isInteger(campo4)) return false;
    if (typeof campo5 !== 'number') return false;
    if (typeof campo6 !== 'boolean') return false;
    return true;
};

// GET: Obtener todos los registros
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM products ORDER BY id ASC');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET: Obtener un registro por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM products WHERE id = $1', [id]);
        
        if (rows.length === 0) return res.status(404).json({ error: 'Registro no encontrado' });
        res.status(200).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST: Crear un nuevo registro
router.post('/', async (req, res) => {
    if (!validateData(req.body)) {
        return res.status(400).json({ error: 'Datos inválidos o incompletos. Revisa los tipos de datos.' });
    }

    const { campo1, campo2, campo3, campo4, campo5, campo6 } = req.body;
    try {
        const queryText = `
            INSERT INTO products (campo1, campo2, campo3, campo4, campo5, campo6) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const { rows } = await db.query(queryText, [campo1, campo2, campo3, campo4, campo5, campo6]);
        // Se responde con 201 Created según el estándar REST
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al insertar en la base de datos' });
    }
});

// PUT: Actualización completa
router.put('/:id', async (req, res) => {
    if (!validateData(req.body)) {
        return res.status(400).json({ error: 'Datos inválidos. PUT requiere todos los campos.' });
    }

    const { id } = req.params;
    const { campo1, campo2, campo3, campo4, campo5, campo6 } = req.body;
    
    try {
        const queryText = `
            UPDATE products 
            SET campo1 = $1, campo2 = $2, campo3 = $3, campo4 = $4, campo5 = $5, campo6 = $6 
            WHERE id = $7 RETURNING *
        `;
        const { rows } = await db.query(queryText, [campo1, campo2, campo3, campo4, campo5, campo6, id]);
        
        if (rows.length === 0) return res.status(404).json({ error: 'Registro no encontrado' });
        res.status(200).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

// PATCH: Actualización parcial
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
    }

    const allowedFields = ['campo1', 'campo2', 'campo3', 'campo4', 'campo5', 'campo6'];
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const key of Object.keys(updates)) {
        if (allowedFields.includes(key)) {
            setClause.push(`${key} = $${paramIndex}`);
            values.push(updates[key]);
            paramIndex++;
        }
    }

    if (setClause.length === 0) return res.status(400).json({ error: 'Campos no permitidos' });

    values.push(id);
    const queryText = `UPDATE products SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    try {
        const { rows } = await db.query(queryText, values);
        if (rows.length === 0) return res.status(404).json({ error: 'Registro no encontrado' });
        res.status(200).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar parcialmente' });
    }
});

// DELETE: Eliminar un registro
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await db.query('DELETE FROM products WHERE id = $1', [id]);
        
        if (rowCount === 0) return res.status(404).json({ error: 'Registro no encontrado' });
        // 204 No Content para borrados exitosos
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

module.exports = router;
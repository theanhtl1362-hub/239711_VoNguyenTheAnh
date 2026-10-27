const express = require('express');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const router = express.Router();

// GET /api/employees?search=An
router.get('/', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const filter = search ? {
      $or: [
        { employeeId: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ]
    } : {};
    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Không thể lấy danh sách nhân viên', error: err.message });
  }
});

// GET /api/employees/:id: accepts MongoDB _id or employeeId
router.get('/:id', async (req, res) => {
  try {
    const key = req.params.id;
    let employee = null;
    if (mongoose.isValidObjectId(key)) employee = await Employee.findById(key);
    if (!employee) employee = await Employee.findOne({ employeeId: key });
    if (!employee) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tìm nhân viên', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { employeeId, fullName, email } = req.body;
    if (!employeeId || !fullName || !email) {
      return res.status(400).json({ message: 'Mã nhân viên, họ tên và email là bắt buộc' });
    }
    const employee = await Employee.create(req.body);
    res.status(201).json({ message: 'Thêm nhân viên thành công', employee });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Mã nhân viên đã tồn tại' });
    if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
    res.status(500).json({ message: 'Không thể thêm nhân viên', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const key = req.params.id;
    const updates = { ...req.body };
    delete updates._id;
    delete updates.__v;
    let employee = null;
    if (mongoose.isValidObjectId(key)) employee = await Employee.findByIdAndUpdate(key, updates, { new: true, runValidators: true });
    if (!employee) employee = await Employee.findOneAndUpdate({ employeeId: key }, updates, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    res.json({ message: 'Cập nhật nhân viên thành công', employee });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Mã nhân viên đã tồn tại' });
    res.status(400).json({ message: 'Không thể cập nhật nhân viên', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const key = req.params.id;
    let employee = null;
    if (mongoose.isValidObjectId(key)) employee = await Employee.findByIdAndDelete(key);
    if (!employee) employee = await Employee.findOneAndDelete({ employeeId: key });
    if (!employee) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Không thể xóa nhân viên', error: err.message });
  }
});

module.exports = router;

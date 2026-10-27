import { useEffect, useState } from 'react';
import React from 'react';
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const blank = {
  employeeId: '', fullName: '', gender: '', dateOfBirth: '', department: '',
  position: '', email: '', phone: '', hireDate: '', status: 'Đang làm việc'
};

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadEmployees(term = search) {
    setLoading(true);
    try {
      const url = `${API}/api/employees${term.trim() ? `?search=${encodeURIComponent(term.trim())}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không tải được danh sách');
      setEmployees(data);
    } catch (err) {
      setMessage(`Lỗi: ${err.message}. Hãy kiểm tra Backend và VITE_API_URL.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEmployees(''); }, []);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setMessage('');
    try {
      const url = editingId ? `${API}/api/employees/${editingId}` : `${API}/api/employees`;
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Thao tác thất bại');
      setMessage(data.message || 'Đã lưu nhân viên');
      setForm(blank);
      setEditingId(null);
      await loadEmployees('');
      setSearch('');
    } catch (err) {
      setMessage(`Lỗi: ${err.message}`);
    }
  }

  function edit(emp) {
    setForm(Object.fromEntries(Object.keys(blank).map(k => [k, emp[k] || (k === 'status' ? 'Đang làm việc' : '')])));
    setEditingId(emp._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(emp) {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân viên ${emp.fullName}?`)) return;
    try {
      const response = await fetch(`${API}/api/employees/${emp._id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Xóa thất bại');
      setMessage(data.message);
      await loadEmployees();
    } catch (err) {
      setMessage(`Lỗi: ${err.message}`);
    }
  }

  return <main className="container">
    <header><p className="eyebrow">NHÂN SỰ • HR MANAGEMENT</p><h1>Quản lý nhân sự</h1>
      <p>Quản lý hồ sơ nhân viên trên MongoDB Atlas</p></header>
    {message && <div className="message">{message}</div>}
    <section className="panel">
      <h2>{editingId ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</h2>
      <form onSubmit={submit}>
        <div className="fields">
          {[
            ['employeeId','Mã nhân viên *'],['fullName','Họ và tên *'],['gender','Giới tính'],
            ['dateOfBirth','Ngày sinh'],['department','Phòng ban'],['position','Chức vụ'],
            ['email','Email *'],['phone','Số điện thoại'],['hireDate','Ngày vào làm']
          ].map(([name,label]) => <label key={name}>{label}
            <input name={name} value={form[name]} onChange={change}
              type={['dateOfBirth','hireDate'].includes(name) ? 'date' : name === 'email' ? 'email' : 'text'}
              required={['employeeId','fullName','email'].includes(name)} />
          </label>)}
          <label>Trạng thái
            <select name="status" value={form.status} onChange={change}>
              <option>Đang làm việc</option><option>Tạm nghỉ</option><option>Đã nghỉ việc</option>
            </select>
          </label>
        </div>
        <div className="actions"><button type="submit">{editingId ? 'Lưu cập nhật' : 'Thêm nhân viên'}</button>
          {editingId && <button type="button" className="secondary" onClick={() => {setEditingId(null); setForm(blank);}}>Hủy sửa</button>}
        </div>
      </form>
    </section>
    <section className="panel">
      <div className="list-heading"><h2>Danh sách nhân viên</h2><span>{employees.length} hồ sơ</span></div>
      <form className="search" onSubmit={e => {e.preventDefault(); loadEmployees(search);}}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo mã nhân viên hoặc họ tên..." />
        <button type="submit">Tìm kiếm</button><button type="button" className="secondary" onClick={() => {setSearch(''); loadEmployees('');}}>Làm mới</button>
      </form>
      {loading ? <p>Đang tải dữ liệu...</p> : <div className="table-wrap"><table>
        <thead><tr><th>Mã NV</th><th>Họ tên</th><th>Phòng ban</th><th>Chức vụ</th><th>Email</th><th>Điện thoại</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>{employees.map(emp => <tr key={emp._id}>
          <td>{emp.employeeId}</td><td>{emp.fullName}</td><td>{emp.department}</td><td>{emp.position}</td>
          <td>{emp.email}</td><td>{emp.phone}</td><td><span className="status">{emp.status}</span></td>
          <td className="row-actions"><button type="button" onClick={() => edit(emp)}>Sửa</button><button type="button" className="danger" onClick={() => remove(emp)}>Xóa</button></td>
        </tr>)}</tbody>
      </table>{employees.length === 0 && <p className="empty">Chưa có dữ liệu nhân viên.</p>}</div>}
    </section>
    <footer>Ứng dụng thực hành Điện toán đám mây</footer>
  </main>;
}

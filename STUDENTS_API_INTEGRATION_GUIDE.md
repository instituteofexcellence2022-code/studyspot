# 🔌 Students Page - API Integration Guide

**File**: `web-owner/src/pages/user/StudentsPage.tsx`  
**Current Status**: Using mock data (MOCK_STUDENTS array)  
**Target**: Use real API (studentsService)

---

## 📋 CHANGES NEEDED

### **1. Update Imports** (Top of file)

**Add**:
```typescript
import studentsService, { Student, StudentsFilters } from '../../services/studentsService';
```

**Remove**:
```typescript
// Remove the INITIAL_STUDENTS constant (mock data)
```

---

### **2. Update State Management**

**Replace**:
```typescript
const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
```

**With**:
```typescript
const [students, setStudents] = useState<Student[]>([]);
const [totalCount, setTotalCount] = useState(0);
const [loading, setLoading] = useState(false);
```

---

### **3. Add useEffect to Fetch Students on Load**

**Add after state declarations**:
```typescript
useEffect(() => {
  fetchStudents();
}, [page, rowsPerPage, searchTerm, statusFilter, feeStatusFilter, planFilter, sortField, sortOrder]);

const fetchStudents = async () => {
  setLoading(true);
  try {
    const filters: StudentsFilters = {
      page: page + 1,  // API uses 1-based indexing
      limit: rowsPerPage,
      search: searchTerm,
      status: statusFilter.join(','),
      feeStatus: feeStatusFilter.join(','),
      plan: planFilter.join(','),
      sortBy: sortField,
      sortOrder: sortOrder,
    };

    const response = await studentsService.getStudents(filters);
    setStudents(response.students);
    setTotalCount(response.pagination.total);
  } catch (error: any) {
    console.error('Error fetching students:', error);
    setSnackbar({
      open: true,
      message: error.response?.data?.error || 'Failed to load students',
      severity: 'error',
    });
  } finally {
    setLoading(false);
  }
};
```

---

### **4. Update handleSaveStudent (Add/Edit)**

**Replace the setTimeout with**:
```typescript
const handleSaveStudent = async () => {
  if (!validateStudent(currentStudent)) {
    setSnackbar({ open: true, message: 'Please fix validation errors', severity: 'error' });
    return;
  }
  
  setLoading(true);
  
  try {
    if (editMode && currentStudent.id) {
      // Update existing student
      await studentsService.updateStudent(currentStudent.id, {
        firstName: currentStudent.firstName,
        lastName: currentStudent.lastName,
        email: currentStudent.email,
        phone: currentStudent.phone,
        status: currentStudent.status,
        currentPlan: currentStudent.currentPlan,
        feeStatus: currentStudent.feeStatus,
      });
      setSnackbar({ open: true, message: 'Student updated successfully!', severity: 'success' });
    } else {
      // Create new student
      await studentsService.createStudent({
        firstName: currentStudent.firstName!,
        lastName: currentStudent.lastName!,
        email: currentStudent.email!,
        phone: currentStudent.phone,
        currentPlan: currentStudent.currentPlan,
        feeStatus: currentStudent.feeStatus,
        status: currentStudent.status,
      });
      setSnackbar({ open: true, message: 'Student added successfully!', severity: 'success' });
    }
    
    setDialogOpen(false);
    fetchStudents();  // Refresh list
  } catch (error: any) {
    console.error('Error saving student:', error);
    setSnackbar({
      open: true,
      message: error.response?.data?.error || 'Failed to save student',
      severity: 'error',
    });
  } finally {
    setLoading(false);
  }
};
```

---

### **5. Update handleDeleteConfirm**

**Replace setTimeout with**:
```typescript
const handleDeleteConfirm = async () => {
  if (studentToDelete) {
    setLoading(true);
    
    try {
      await studentsService.deleteStudent(studentToDelete.id);
      setSnackbar({ open: true, message: 'Student deleted successfully!', severity: 'success' });
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      fetchStudents();  // Refresh list
    } catch (error: any) {
      console.error('Error deleting student:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete student',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }
};
```

---

### **6. Update handleExportCSV**

**Replace client-side CSV generation with**:
```typescript
const handleExportCSV = async () => {
  try {
    const blob = await studentsService.exportToCSV({
      search: searchTerm,
      status: statusFilter.join(','),
      feeStatus: feeStatusFilter.join(','),
      plan: planFilter.join(','),
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Students exported to CSV!', severity: 'success' });
  } catch (error: any) {
    console.error('Error exporting students:', error);
    setSnackbar({
      open: true,
      message: 'Failed to export students',
      severity: 'error',
    });
  }
};
```

---

### **7. Update filtered/paginated Students**

**Remove useMemo for filtering and pagination** (API handles this now):

```typescript
// REMOVE these useMemo hooks:
// const filteredStudents = useMemo(...)
// const paginatedStudents = useMemo(...)

// Use students directly from API:
// In your DataGrid, use: students (not paginatedStudents)
// For total count, use: totalCount (from state)
```

---

### **8. Update Pagination Component**

**Change count prop**:
```typescript
<TablePagination
  component="div"
  count={totalCount}  // Changed from filteredStudents.length
  page={page}
  onPageChange={(_, newPage) => setPage(newPage)}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={(e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }}
  rowsPerPageOptions={[5, 10, 25, 50, 100]}
/>
```

---

### **9. Add Loading Indicator in Table**

**Wrap DataGrid with loading state**:
```typescript
{loading ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
    <CircularProgress />
  </Box>
) : (
  <DataGrid
    rows={students}
    columns={columns}
    // ... rest of props
  />
)}
```

---

### **10. Update Stats Cards** (Optional - Real-time data)

**Replace mock counts with API data**:
```typescript
// Total Students - from API
<Typography variant="h4">{totalCount}</Typography>

// Active Students - from filtered data
<Typography variant="h4" color="success.main">
  {students.filter(s => s.status === 'active').length}
</Typography>

// Fee Paid - from filtered data
<Typography variant="h4" color="success.main">
  {students.filter(s => s.feeStatus === 'paid').length}
</Typography>

// Fee Pending - from filtered data
<Typography variant="h4" color="warning.main">
  {students.filter(s => s.feeStatus === 'pending' || s.feeStatus === 'overdue').length}
</Typography>
```

---

## 🎯 QUICK IMPLEMENTATION STEPS

1. **Backup current file**: Copy `StudentsPage.tsx` to `StudentsPage_OLD.tsx`
2. **Make imports changes** (Step 1)
3. **Update state** (Step 2)
4. **Add fetch function** (Step 3)
5. **Update CRUD handlers** (Steps 4-6)
6. **Remove client-side filtering** (Step 7)
7. **Update pagination** (Step 8)
8. **Add loading state** (Step 9)
9. **Test thoroughly**

---

## ✅ TESTING CHECKLIST

After making changes, test:
- [ ] Page loads and fetches students from API
- [ ] Search works (with API call)
- [ ] Filters work (status, fee status, plan)
- [ ] Pagination works (shows correct total count)
- [ ] Sorting works (columns)
- [ ] Add student works (creates in database)
- [ ] Edit student works (updates in database)
- [ ] Delete student works (removes from database)
- [ ] Export CSV works (downloads from API)
- [ ] Loading states appear
- [ ] Error messages show when API fails

---

## 🐛 COMMON ISSUES & FIXES

### **Issue 1: "Cannot connect to server"**
**Fix**: Ensure API server is running on port 3001

### **Issue 2: "Unauthorized" errors**
**Fix**: Check if auth token is valid in localStorage

### **Issue 3: Empty list even though data exists**
**Fix**: Check browser console for CORS errors

### **Issue 4: Filters not working**
**Fix**: Ensure filter values are joined with commas before sending to API

### **Issue 5: Pagination shows wrong total**
**Fix**: Use `totalCount` from API response, not `students.length`

---

## 📝 COMPLETE EXAMPLE

Here's a minimal working example of the key parts:

```typescript
import React, { useState, useEffect } from 'react';
import studentsService, { Student } from '../../services/studentsService';

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchStudents();
  }, [page, rowsPerPage]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentsService.getStudents({
        page: page + 1,
        limit: rowsPerPage,
      });
      setStudents(response.students);
      setTotalCount(response.pagination.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

---

## 🚀 DEPLOYMENT

After testing locally:
1. Commit changes: `git add . && git commit -m "feat: Connect Students to real API"`
2. Push to GitHub: `git push`
3. Vercel will auto-deploy
4. Test in production

---

## 📊 EXPECTED BEHAVIOR

### **Before (Mock Data)**:
- Data resets on page reload
- Max 10 students (hardcoded)
- No real database

### **After (Real API)**:
- Data persists in database
- Unlimited students
- Search across all records
- Server-side pagination
- Real-time updates

---

**Ready to implement?** This guide covers all necessary changes to connect your Students page to the real API!



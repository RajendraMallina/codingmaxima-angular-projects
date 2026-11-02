import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface StudentRecord {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly marks: number;
  readonly gender: 'Male' | 'Female' | 'Other';
  readonly education: string;
  readonly scholarship: boolean;
}

@Component({
  imports: [FormsModule],
  selector: 'app-student-records',
  styleUrl: './student-records.css',
  templateUrl: './student-records.html',
})
export class StudentRecords {
  protected readonly students = signal<readonly StudentRecord[]>([]);
  protected readonly selectedIds = signal<readonly number[]>([]);
  protected readonly statusMessage = signal('Your class list is ready. Add a student to get started.');
  protected readonly allSelected = () => this.students().length > 0 && this.selectedIds().length === this.students().length;
  protected readonly selectedCount = () => this.selectedIds().length;
  private nextId = 1;

  protected addStudent(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.statusMessage.set('Check the highlighted fields and complete the form.');
      return;
    }

    const value = form.value;
    const student: StudentRecord = {
      id: this.nextId++,
      name: String(value.name).trim(),
      email: String(value.email).trim(),
      marks: Number(value.marks),
      gender: value.gender,
      education: value.education,
      scholarship: Boolean(value.scholarship),
    };
    this.students.update((records) => [...records, student]);
    this.statusMessage.set(`${student.name} was added to the class list.`);
    form.resetForm({ education: '', scholarship: false });
  }

  protected toggleStudent(id: number, checked: boolean): void {
    this.selectedIds.update((ids) => checked ? [...new Set([...ids, id])] : ids.filter((selectedId) => selectedId !== id));
  }

  protected toggleAll(checked: boolean): void {
    this.selectedIds.set(checked ? this.students().map((student) => student.id) : []);
  }

  protected deleteSelected(): void {
    const count = this.selectedIds().length;
    if (count === 0) return;
    const selected = new Set(this.selectedIds());
    this.students.update((records) => records.filter((student) => !selected.has(student.id)));
    this.selectedIds.set([]);
    this.statusMessage.set(`${count} ${count === 1 ? 'student was' : 'students were'} removed.`);
  }

  protected deleteAll(): void {
    const count = this.students().length;
    if (count === 0) return;
    this.students.set([]);
    this.selectedIds.set([]);
    this.statusMessage.set(`All ${count} ${count === 1 ? 'student record was' : 'student records were'} removed.`);
  }
}

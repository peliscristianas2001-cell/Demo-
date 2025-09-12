
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { PlusCircle, MoreHorizontal, Edit, Trash2, Clipboard, UserPlus, Redo, HelpCircle } from "lucide-react"
import { mockEmployees } from "@/lib/mock-data"
import type { Employee } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GuideDialog } from "@/components/admin/guide-dialog";
import { guides } from "@/lib/guides";

type FormData = Omit<Employee, 'id'>;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [exEmployees, setExEmployees] = useState<Employee[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState<FormData>({ name: '', dni: '', phone: '', password: '', fixedSalary: 0 });
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true)
    const storedEmployees = localStorage.getItem("app_employees")
    const storedExEmployees = localStorage.getItem("app_ex_employees")
    setEmployees(storedEmployees ? JSON.parse(storedEmployees) : mockEmployees)
    setExEmployees(storedExEmployees ? JSON.parse(storedExEmployees) : [])

    const handleStorageChange = () => {
      const newStoredEmployees = localStorage.getItem("app_employees")
      const newStoredExEmployees = localStorage.getItem("app_ex_employees")
      setEmployees(newStoredEmployees ? JSON.parse(newStoredEmployees) : mockEmployees)
      setExEmployees(newStoredExEmployees ? JSON.parse(newStoredExEmployees) : [])
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [])
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("app_employees", JSON.stringify(employees));
      localStorage.setItem("app_ex_employees", JSON.stringify(exEmployees));
    }
  }, [employees, exEmployees, isClient])
  
  useEffect(() => {
    if (selectedEmployee) {
        setFormData({
            name: selectedEmployee.name,
            dni: selectedEmployee.dni,
            phone: selectedEmployee.phone,
            password: selectedEmployee.password || '',
            fixedSalary: selectedEmployee.fixedSalary || 0
        });
    } else {
        setFormData({ name: '', dni: '', phone: '', password: '', fixedSalary: 0 });
    }
  }, [selectedEmployee, isFormOpen]);

  const getRegistrationLink = (employeeId: string) => {
    if (isClient) {
      return `${window.location.origin}/employee/register?employeeId=${employeeId}`;
    }
    return "";
  }

  const handleCopyLink = (employeeId: string) => {
    const link = getRegistrationLink(employeeId);
    if (link) {
      navigator.clipboard.writeText(link).then(() => {
        toast({ title: "¡Copiado!", description: "El link de registro se ha copiado al portapapeles." });
      });
    }
  }

  const handleCreate = () => {
    setSelectedEmployee(null)
    setIsFormOpen(true)
  }

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsFormOpen(true)
  }

  const handleRehireSelect = (employeeId: string) => {
      const employeeToRehire = exEmployees.find(s => s.id === employeeId);
      if (employeeToRehire) {
          setSelectedEmployee({ ...employeeToRehire, password: '' }); // Clear password for re-registration
          setIsFormOpen(true);
      }
  }
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [id]: id === 'fixedSalary' ? parseFloat(value) || 0 : value
    }));
  }

  const handleSave = () => {
    const { name } = formData;
    if (!name) {
        toast({ title: "Datos incompletos", description: "El nombre es obligatorio.", variant: "destructive" });
        return;
    }

    const employeeData: Employee = {
        id: selectedEmployee?.id || `E-${Math.random().toString(36).substring(2, 11)}`,
        ...formData
    }

    if (selectedEmployee) {
      // Check if it's a re-hire
      const isRehiring = exEmployees.some(s => s.id === employeeData.id);
      if (isRehiring) {
        setExEmployees(prev => prev.filter(s => s.id !== employeeData.id));
        setEmployees(prev => [...prev, employeeData]);
      } else {
        setEmployees(employees.map(s => s.id === employeeData.id ? employeeData : s))
      }
    } else {
      setEmployees([...employees, employeeData])
    }
    
    setIsFormOpen(false)
    setSelectedEmployee(null)
    toast({ title: "¡Éxito!", description: "El empleado/a ha sido guardado/a." });
  }

  const handleDelete = (employeeToDelete: Employee) => {
    const employeeWithoutPassword = { ...employeeToDelete, password: '' };
    setEmployees(prev => prev.filter(s => s.id !== employeeToDelete.id));
    setExEmployees(prev => [...prev, employeeWithoutPassword]);
    toast({ title: "Empleado/a archivado/a", description: "El empleado/a ha sido movido/a a ex-empleados." });
  }

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-6">
       <GuideDialog
        isOpen={isGuideOpen}
        onOpenChange={setIsGuideOpen}
        title={guides.employees.title}
        description={guides.employees.description}
        content={guides.employees.content}
      />
       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedEmployee ? "Editar Empleado" : "Nuevo Empleado"}</DialogTitle>
                <DialogDescription>
                {selectedEmployee ? "Modifica los datos del empleado." : "Añade un nuevo empleado al sistema."}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" value={formData.name} onChange={handleFormChange}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="dni">DNI</Label>
                    <Input id="dni" value={formData.dni} onChange={handleFormChange}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" value={formData.phone} onChange={handleFormChange}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="fixedSalary">Sueldo Fijo ($)</Label>
                    <Input id="fixedSalary" type="number" value={formData.fixedSalary} onChange={handleFormChange} placeholder="Ej: 150000"/>
                </div>

                {selectedEmployee && (
                    <div className="space-y-2 pt-4">
                        <Label>Link de Registro Único</Label>
                         <div className="flex items-center gap-2">
                            <Input value={getRegistrationLink(selectedEmployee.id)} readOnly className="text-muted-foreground"/>
                            <Button size="icon" variant="outline" onClick={() => handleCopyLink(selectedEmployee.id)}>
                                <Clipboard className="w-4 h-4"/>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Comparte este link para que el empleado pueda (re)crear su contraseña.</p>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
        </DialogContent>
       </Dialog>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Empleados</h2>
          <p className="text-muted-foreground">
            Añade, edita o archiva a los empleados de la empresa.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => setIsGuideOpen(true)}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Guía de la Sección
            </Button>
           {exEmployees.length > 0 && (
             <Select onValueChange={handleRehireSelect}>
                <SelectTrigger className="w-[200px] h-10">
                    <SelectValue placeholder="Recontratar..." />
                </SelectTrigger>
                <SelectContent>
                    {exEmployees.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
            </Select>
           )}
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Empleado
            </Button>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link Reg.</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Sueldo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No hay empleados registrados.
                  </TableCell>
                </TableRow>
              ) : employees.map((employee) => (
                  <TableRow key={employee.id}>
                     <TableCell>
                      <Button variant="outline" size="icon" onClick={() => handleCopyLink(employee.id)}>
                        <Clipboard className="w-4 h-4" />
                        <span className="sr-only">Copiar link de registro</span>
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.dni}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>${(employee.fixedSalary || 0).toLocaleString('es-AR')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(employee)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(employee)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Archivar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

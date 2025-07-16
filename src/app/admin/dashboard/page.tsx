import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>¡Bienvenida al Panel de Administración!</CardTitle>
          <CardDescription>
            Desde aquí podrás gestionar los viajes, las reservas, los pasajeros y la configuración de tu sitio web "YO TE LLEVO".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Utiliza el menú de la izquierda para navegar por las diferentes secciones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

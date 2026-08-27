import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCircleSchema, type CreateCircleFormValues } from '@/lib/validation/circle';
import { useCreateCircle } from '@/hooks/useCircles';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export function CreateCirclePage() {
  const createCircle = useCreateCircle();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCircleFormValues>({
    resolver: zodResolver(createCircleSchema),
    defaultValues: { cycleFrequency: 'monthly' },
  });

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader className="flex-col items-start pb-1">
          <h1 className="text-xl font-semibold text-foreground">Create a circle</h1>
          <p className="text-sm text-foreground-muted">
            You'll be its admin — you confirm contributions and manage members.
          </p>
        </CardHeader>
        <CardBody>
          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((values) => createCircle.mutate(values))}
          >
            <div>
              <Label htmlFor="name">Circle name</Label>
              <Input id="name" placeholder="Hostel Block C Savings" {...register('name')} />
              <FieldError>{errors.name?.message}</FieldError>
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input id="description" placeholder="What's this circle for?" {...register('description')} />
              <FieldError>{errors.description?.message}</FieldError>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contributionAmount">Contribution amount (₹)</Label>
                <Input id="contributionAmount" type="number" min={1} {...register('contributionAmount')} />
                <FieldError>{errors.contributionAmount?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="maxMembers">Max members</Label>
                <Input id="maxMembers" type="number" min={2} max={50} {...register('maxMembers')} />
                <FieldError>{errors.maxMembers?.message}</FieldError>
              </div>
            </div>

            <div>
              <Label htmlFor="cycleFrequency">Collects every</Label>
              <select
                id="cycleFrequency"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
                {...register('cycleFrequency')}
              >
                <option value="weekly">Week</option>
                <option value="monthly">Month</option>
              </select>
            </div>

            {createCircle.isError && <FieldError>Something went wrong creating the circle.</FieldError>}

            <Button type="submit" loading={createCircle.isPending} className="mt-1">
              Create circle
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

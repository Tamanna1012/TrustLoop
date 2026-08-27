import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { joinCircleSchema, type JoinCircleFormValues } from '@/lib/validation/circle';
import { useJoinCircle } from '@/hooks/useCircles';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export function JoinCirclePage() {
  const joinCircle = useJoinCircle();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinCircleFormValues>({ resolver: zodResolver(joinCircleSchema) });

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader className="flex-col items-start pb-1">
          <h1 className="text-xl font-semibold text-foreground">Join a circle</h1>
          <p className="text-sm text-foreground-muted">Ask the circle's admin for the invite code.</p>
        </CardHeader>
        <CardBody>
          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((values) => joinCircle.mutate(values.inviteCode))}
          >
            <div>
              <Label htmlFor="inviteCode">Invite code</Label>
              <Input id="inviteCode" placeholder="TL-8F2K1A9C" className="font-mono uppercase" {...register('inviteCode')} />
              <FieldError>{errors.inviteCode?.message}</FieldError>
            </div>
            {joinCircle.isError && (
              <FieldError>That code didn't match a circle that's still accepting members.</FieldError>
            )}
            <Button type="submit" loading={joinCircle.isPending} className="mt-1">
              Join circle
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

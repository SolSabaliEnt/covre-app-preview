import type { ApiResult } from '../api/types';
import { getBackendMode } from '../lib/backendMode';
import { getSupabaseClient } from '../lib/supabaseClient';

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

function fail<T = never>(code: string, message: string): ApiResult<T> {
  return { ok: false, error: { code, message } };
}

export async function getProviderWorkerAvatarUrls(workerIds: string[]): Promise<ApiResult<Record<string, string>>> {
  if (getBackendMode() !== 'supabase' || workerIds.length === 0) return ok({});

  try {
    const supabase = getSupabaseClient();
    const uniqueIds = [...new Set(workerIds.filter(Boolean))];
    const { data, error } = await supabase
      .from('worker_profiles')
      .select('id, avatar_path')
      .in('id', uniqueIds);
    if (error) return fail('worker_avatar_paths', error.message);

    const rows = (data ?? []) as Array<{ id: string; avatar_path: string | null }>;
    const withPaths = rows.filter(row => Boolean(row.avatar_path));
    if (withPaths.length === 0) return ok({});

    const signed = await Promise.all(
      withPaths.map(async row => {
        const { data: signedData, error: signedError } = await supabase.storage
          .from('worker-avatars')
          .createSignedUrl(row.avatar_path!, 60 * 60);
        return signedError || !signedData?.signedUrl ? null : [row.id, signedData.signedUrl] as const;
      }),
    );

    return ok(Object.fromEntries(signed.filter((row): row is readonly [string, string] => Boolean(row))));
  } catch (error) {
    return fail('unexpected', error instanceof Error ? error.message : 'Unable to load worker photos.');
  }
}

export async function getProviderWorkerAvatarUrl(workerId: string): Promise<ApiResult<string | undefined>> {
  const result = await getProviderWorkerAvatarUrls([workerId]);
  if (!result.ok) return result;
  return ok(result.data[workerId]);
}

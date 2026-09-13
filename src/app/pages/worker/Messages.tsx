import { listWorkerMessages } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { MessageSquareText } from 'lucide-react';

function LoadingBlock() {
  return (
    <div className="border-y border-[#DDE7E8] py-12 text-center">
      <p className="text-sm font-medium text-[#607583]">Loading conversations…</p>
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border-y border-[#DDE7E8] py-10 text-center">
      <p className="text-sm text-[#607583]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B243A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53B59F]"
      >
        Try again
      </button>
    </div>
  );
}

export default function WorkerMessages() {
  const { data: threads, error, loading, reload } = useAsyncResource(() => listWorkerMessages(), []);

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Stay in the loop</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Messages</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">
            Shift updates, site communication, and Covre support — without digging through separate inboxes.
          </p>
        </header>

        <div className="pt-4">
          {loading && <LoadingBlock />}
          {error && <ErrorBlock message={error.message} onRetry={reload} />}

          {!loading && !error && threads && threads.length === 0 && (
            <section className="border-y border-[#DDE7E8] py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F6F2] text-[#257665]">
                <MessageSquareText className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-4 text-base font-semibold text-[#13334F]">No messages yet.</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#607583]">
                Shift updates and support conversations will appear here when there’s something you need to see.
              </p>
            </section>
          )}

          {!loading && !error && threads && threads.length > 0 && (
            <div className="border-t border-[#BFCED4]">
              {threads.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className="flex min-h-16 w-full items-start gap-4 border-b border-[#DDE7E8] py-4 text-left transition-colors hover:bg-[#F7FAFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53B59F]"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E6F6F2] text-[#257665]">
                    <MessageSquareText className="h-4.5 w-4.5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#13334F]">{t.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#607583]">{t.lastMessage}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-[#9AAAB3]">{t.timestamp}</p>
                        {t.unreadCount > 0 && (
                          <span className="mt-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[#53B59F] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                            {t.unreadCount > 9 ? '9+' : t.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              <p className="py-5 text-xs leading-5 text-[#9AAAB3]">Secure messaging will connect here as the communication layer comes online.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

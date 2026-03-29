export default function SeedDialog({ seed }: { seed: string }) {
    const words = seed.split(" ");

    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm font-semibold text-destructive">
                    Do not screenshot this. Do not copy paste this.
                </p>
            </div>
            <p className="text-sm text-muted-foreground">
                We will only display the following seed once. Please make sure to
                write it down on paper and store it somewhere safe to recover your
                account and decrypt your message history if you forget your
                password.
            </p>
            <div className="grid grid-cols-4 gap-2 font-mono text-sm">
                {words.map((word, i) => (
                    <div
                        key={i}
                        className="rounded-md border bg-muted/50 px-2 py-1.5 text-center"
                    >
                        <span className="text-muted-foreground">{i + 1}.</span>{" "}
                        {word}
                    </div>
                ))}
            </div>
        </div>
    );
}

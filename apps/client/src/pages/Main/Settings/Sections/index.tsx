export default function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
    return (
        <section className="px-5 py-4">
            <h6>{title}</h6>
            <hr />
            {children}
        </section>
    )
}
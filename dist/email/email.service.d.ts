export declare class EmailService {
    private transporter;
    constructor();
    sendEmail({ to, cc, subject, html, }: {
        to: string | string[];
        cc?: string | string[];
        subject: string;
        html: string;
    }): Promise<boolean>;
}

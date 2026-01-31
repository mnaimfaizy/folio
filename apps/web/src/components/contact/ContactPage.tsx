import { BookSuggestionsComponent } from "@/components/shared/BookSuggestionsComponent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Define form schema with Zod
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(3, { message: "Subject is required." }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." }),
  // Fix: Use .min(1) for required string validation
  inquiryType: z.string().min(1, { message: "Please select an inquiry type." }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Initialize react-hook-form with zod validation
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      // Fix: Use undefined as default for required Select field
      inquiryType: undefined,
    },
  });

  // Form submission handler
  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);

    // Simulate API call with a Promise for test compatibility
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Form submitted:", data);
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Your message has been sent successfully!", {
      description: "We'll get back to you as soon as possible.",
    });
    form.reset();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Have a question or feedback? We'd love to hear from you. Get in touch
          with our team using the form below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <CardDescription>
                Fill out this form and we'll get back to you as soon as
                possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center">
                  <CheckCircle
                    className="h-12 w-12 text-green-500 mx-auto mb-4"
                    data-testid="check-circle-icon"
                  />
                  <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                  <p className="mb-4">
                    Your message has been received. We'll respond to your
                    inquiry shortly.
                  </p>
                  <Button onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    role="form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your email address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="inquiryType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inquiry Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an inquiry type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">
                                  General Question
                                </SelectItem>
                                <SelectItem value="membership">
                                  Membership
                                </SelectItem>
                                <SelectItem value="books">
                                  Book Inquiry
                                </SelectItem>
                                <SelectItem value="events">
                                  Events & Programs
                                </SelectItem>
                                <SelectItem value="feedback">
                                  Feedback
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Subject of your message"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Your message..."
                              className="min-h-[150px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Please provide as much detail as possible.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin">◌</span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex">
                <MapPin className="h-5 w-5 mr-3 text-blue-600 shrink-0" />
                <div>
                  <h3 className="font-medium" id="contact-address-heading">
                    Address
                  </h3>
                  <address className="text-muted-foreground not-italic">
                    123 Library Lane
                    <br />
                    Bookville, BK 12345
                    <br />
                    United States
                  </address>
                </div>
              </div>

              <div className="flex">
                <Phone className="h-5 w-5 mr-3 text-blue-600 shrink-0" />
                <div>
                  <h3 className="font-medium" id="contact-phone-heading">
                    Phone
                  </h3>
                  <p className="text-muted-foreground">(555) 123-4567</p>
                </div>
              </div>

              <div className="flex">
                <Mail className="h-5 w-5 mr-3 text-blue-600 shrink-0" />
                <div>
                  <h3 className="font-medium" id="contact-email-heading">
                    Email
                  </h3>
                  <p className="text-muted-foreground">
                    contact@librarysystem.org
                  </p>
                </div>
              </div>

              <div className="flex">
                <Clock className="h-5 w-5 mr-3 text-blue-600 shrink-0" />
                <div>
                  <h3 className="font-medium" id="contact-hours-heading">
                    Library Hours
                  </h3>
                  <div className="text-muted-foreground">
                    <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
                    <p>Saturday: 10:00 AM - 6:00 PM</p>
                    <p>Sunday: 12:00 PM - 5:00 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-0">
            <CardHeader>
              <CardTitle>Need Help Fast?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                For immediate assistance with your account or digital resources:
              </p>
              <Button variant="default" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Call Help Desk
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Find Us</h2>
        <div className="border rounded-lg overflow-hidden h-[400px]">
          {/* This would be a real map integration in production */}
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center p-8">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Library Location</h3>
              <p>Located in downtown Bookville, near Central Park</p>
              <Button variant="link" className="mt-4">
                Get Directions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              question: "How do I get a library card?",
              answer:
                "Library cards are free for residents. Just bring a photo ID and proof of address to the front desk, and we'll set you up with a card in minutes.",
            },
            {
              question: "Can I renew my books online?",
              answer:
                "Yes! You can renew books online through your account, by phone, or in person as long as there isn't a hold on the item.",
            },
            {
              question: "What if I return my book late?",
              answer:
                "Late fees are $0.25 per day with a maximum fee of $10 per item. We also offer a grace period of 3 days after the due date.",
            },
            {
              question: "Do you offer interlibrary loans?",
              answer:
                "Yes, we can request books from other libraries if we don't have what you're looking for. Ask at the reference desk for assistance.",
            },
          ].map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Book Suggestions */}
      <BookSuggestionsComponent
        title="Staff Picks This Month"
        description="Our librarians recommend these great reads while you wait for a response"
        className="mt-12"
      />
    </div>
  );
}

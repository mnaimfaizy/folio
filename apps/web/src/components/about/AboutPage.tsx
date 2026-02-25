import {
  BookOpen,
  Clock,
  Users,
  Award,
  GraduationCap,
  Globe,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSettings } from '@/context/SettingsContext';

// Helper to map icon names to icon components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Clock,
  Users,
  Award,
  GraduationCap,
  Globe,
};

export function AboutPage() {
  const { settings } = useSettings();

  return (
    <div>
      {/* Full-width hero banner */}
      <section className="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About Our Library
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Discover how we've been serving readers and promoting literacy in
            our community for over {settings.about_years_service || '30+'}{' '}
            years.
          </p>
        </div>
      </section>
      {/* Body content */}
      <div className="container mx-auto py-12 px-4 max-w-screen-xl">
        {/* Mission & Vision */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  {settings.about_mission_text ||
                    'To inspire, educate, and empower our community by providing equal access to knowledge, fostering a love of reading, and promoting lifelong learning through high-quality resources and innovative services.'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  {settings.about_vision_text ||
                    'To be a vibrant hub where knowledge, creativity, and community thrive, offering accessible services that evolve with technological advancements while preserving the joy of reading and discovery.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Library Facts */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Library by the Numbers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold mb-2">
                  {settings.about_books_collection || '50,000+'}
                </h3>
                <p className="text-muted-foreground">Books in Collection</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold mb-2">
                  {settings.about_active_members || '12,000+'}
                </h3>
                <p className="text-muted-foreground">Active Members</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-full">
                    <Clock className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold mb-2">
                  {settings.about_years_service || '30+'}
                </h3>
                <p className="text-muted-foreground">Years of Service</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold mb-2">
                  {settings.about_community_awards || '15'}
                </h3>
                <p className="text-muted-foreground">Community Awards</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Library History */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Our History</h2>
            <div className="space-y-6">
              {(settings.about_history_text || '')
                .split('\n\n')
                .filter((p) => p.trim())
                .map((paragraph, index) => (
                  <p key={index}>{paragraph.trim()}</p>
                ))}
              {!settings.about_history_text && (
                <>
                  <p>
                    Founded in 1990, our library began as a small community
                    reading room with just 500 books. Today, we've grown into a
                    comprehensive digital and physical library serving thousands
                    of readers across the region.
                  </p>
                  <p>
                    Through the decades, we've embraced technological change
                    while maintaining our core mission of providing free access
                    to information and promoting literacy. In 2010, we launched
                    our first digital catalog, and in 2018, we completely
                    renovated our main building to create more collaborative
                    spaces.
                  </p>
                  <p>
                    Our library has been recognized for excellence in community
                    service, innovative programming, and our commitment to
                    digital inclusion. We continue to evolve with the changing
                    needs of our community while preserving the joy of reading
                    and discovery that has always been at our core.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Our Library Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(settings.about_team_members || []).map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-8 flex justify-center">
                  <Avatar className="h-32 w-32">
                    <AvatarFallback
                      className={`${member.bgColor} text-white text-2xl`}
                    >
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription className="font-medium text-blue-600">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Programs and Services */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Programs & Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(settings.about_programs || []).map((service, index) => {
              const IconComponent = iconMap[service.icon] || BookOpen;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>{' '}
      {/* end body container */}
    </div>
  );
}

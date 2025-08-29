'use client';

import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Users, 
  Briefcase,
  Heart,
  Scale,
  Phone,
  Mail
} from 'lucide-react';
import { Header, BottomNav, PageHeader } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ComplianceNotice } from '@/components/Compliance';

export default function CompliancePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--neutral-50)' }}>
      <Header />
      
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          <PageHeader
            title="Compliance Guidelines"
            description="Professional standards and regulatory requirements for wellness industry services"
          />

          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: 'var(--primary-teal)' }} />
                Regulatory Compliance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p>
                  The wellness, spa, and salon industry operates under various federal, state, and local 
                  regulations designed to protect both service providers and clients. This guide outlines 
                  key compliance requirements and professional standards to ensure ethical, safe, and 
                  effective business practices.
                </p>
                
                <p className="mb-4">
                  <strong>Important:</strong> This information is for educational purposes only and does not 
                  constitute legal advice. Always consult with qualified legal and regulatory professionals 
                  for specific compliance requirements in your jurisdiction.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Wellness Industry Guidelines */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" style={{ color: 'var(--secondary-sage)' }} />
                Wellness Industry Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="heading-4 mb-3">Service Descriptions & Claims</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>Focus on relaxation, stress relief, and wellness benefits</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>Use terms like "may help promote," "designed to support," or "intended for relaxation"</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                      <span>Avoid medical claims or promises to cure, treat, or diagnose conditions</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                      <span>Do not use terms like "therapeutic," "healing," or "medical" without proper licensing</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="heading-4 mb-3">Client Consultation Requirements</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>Always conduct thorough health history consultations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>Document any contraindications or health concerns</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>Refer clients to healthcare providers when appropriate</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>Obtain informed consent for all services</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Standards */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" style={{ color: 'var(--primary-teal)' }} />
                Professional Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="heading-4 mb-3">Licensing & Certification</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Maintain current professional licenses</li>
                    <li>• Complete required continuing education</li>
                    <li>• Display licenses prominently in business</li>
                    <li>• Ensure staff meet certification requirements</li>
                    <li>• Keep documentation readily available</li>
                  </ul>
                </div>

                <div>
                  <h3 className="heading-4 mb-3">Health & Safety Protocols</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Follow proper sanitation procedures</li>
                    <li>• Maintain clean, safe facilities</li>
                    <li>• Use approved products and equipment</li>
                    <li>• Implement infection control measures</li>
                    <li>• Train staff on emergency procedures</li>
                  </ul>
                </div>

                <div>
                  <h3 className="heading-4 mb-3">Client Privacy & Confidentiality</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Protect client personal information</li>
                    <li>• Secure storage of client records</li>
                    <li>• Limit access to authorized personnel</li>
                    <li>• Obtain consent before sharing information</li>
                    <li>• Follow HIPAA guidelines where applicable</li>
                  </ul>
                </div>

                <div>
                  <h3 className="heading-4 mb-3">Ethical Business Practices</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Provide clear, accurate service descriptions</li>
                    <li>• Display pricing transparently</li>
                    <li>• Honor promotional offers and warranties</li>
                    <li>• Handle complaints professionally</li>
                    <li>• Maintain professional boundaries</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regulatory Requirements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                Key Regulatory Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="heading-4 mb-3">Federal Requirements</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg" style={{ borderColor: 'var(--neutral-200)' }}>
                      <h4 className="font-semibold mb-2">FDA Compliance</h4>
                      <p className="text-sm">Product claims must comply with FDA regulations. Cosmetic products cannot claim to treat or cure medical conditions.</p>
                    </div>
                    <div className="p-3 border rounded-lg" style={{ borderColor: 'var(--neutral-200)' }}>
                      <h4 className="font-semibold mb-2">FTC Truth in Advertising</h4>
                      <p className="text-sm">All advertising claims must be truthful, substantiated, and not misleading to consumers.</p>
                    </div>
                    <div className="p-3 border rounded-lg" style={{ borderColor: 'var(--neutral-200)' }}>
                      <h4 className="font-semibold mb-2">OSHA Workplace Safety</h4>
                      <p className="text-sm">Maintain safe working conditions and comply with occupational health standards.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="heading-4 mb-3">State & Local Requirements</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800 mb-2">Location-Specific Requirements</p>
                        <p className="text-sm text-yellow-700">
                          Requirements vary significantly by state and locality. Common areas of regulation include:
                        </p>
                        <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                          <li>• Professional licensing and certification</li>
                          <li>• Business permits and registrations</li>
                          <li>• Health department regulations</li>
                          <li>• Zoning and building codes</li>
                          <li>• Consumer protection laws</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Materials Compliance */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: 'var(--info)' }} />
                Training Materials Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">
                  When using AI-generated training materials, ensure all content complies with applicable 
                  regulations and professional standards:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Best Practices</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Review all content before implementation</li>
                      <li>• Adapt materials to local requirements</li>
                      <li>• Train staff on compliance expectations</li>
                      <li>• Document training completion</li>
                      <li>• Update materials as regulations change</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Red Flags to Avoid</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Unsubstantiated health claims</li>
                      <li>• Medical terminology without license</li>
                      <li>• Pressure tactics or false urgency</li>
                      <li>• Discriminatory language or practices</li>
                      <li>• Privacy violations or data misuse</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" style={{ color: 'var(--secondary-sage)' }} />
                Additional Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="heading-4 mb-3">Professional Organizations</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• International Spa Association (ISPA)</li>
                    <li>• Professional Beauty Association (PBA)</li>
                    <li>• Associated Bodywork & Massage Professionals (ABMP)</li>
                    <li>• American Massage Therapy Association (AMTA)</li>
                    <li>• Society of Dermatology SkinCare Specialists</li>
                  </ul>
                </div>

                <div>
                  <h3 className="heading-4 mb-3">Regulatory Agencies</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Food and Drug Administration (FDA)</li>
                    <li>• Federal Trade Commission (FTC)</li>
                    <li>• Occupational Safety & Health Administration (OSHA)</li>
                    <li>• State licensing boards</li>
                    <li>• Local health departments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" style={{ color: 'var(--primary-teal)' }} />
                Need Compliance Support?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  For specific compliance questions or regulatory guidance, consult with qualified professionals:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-600" />
                    <span>Legal counsel specializing in business/health law</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Professional association compliance resources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>State licensing board guidance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Notices */}
          <div className="mt-8 space-y-4">
            <ComplianceNotice type="wellness" variant="inline" dismissible={false} />
            <ComplianceNotice type="spa" variant="inline" dismissible={false} />
            <ComplianceNotice type="salon" variant="inline" dismissible={false} />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}